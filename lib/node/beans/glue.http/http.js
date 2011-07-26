var Structr = require('structr'),
	express = require('express'),
	http = require('http'),
	Url = require('url'),
	exec = require('child_process').exec,
	Queue = require('sk/core/queue').Queue;
                            
/**
 * the transport between two proxies
 */


function _request(ops, data, callback)
{
	if(!callback) callback = function(){};
	
	if(!ops.method) ops.method = 'GET';
	

	ops.connection = 'close';
	
	ops.headers = { accept: '*/*' };


	var req = http.request(ops, function(res)
	{
		res.setEncoding('utf8');
		
		var buffer = '';

		res.on('data', function(data)
		{
			buffer += data;
		});
		
		res.on('end', function()
		{
			if(callback) callback(false, buffer);
		});
	});
	
	req.on('error', callback);
	
	
	if(ops.method != 'GET' && data)
	{
		ops.headers['content-length'] = (data || '').length+1;
		ops.headers['content-type'] = 'application/x-www-form-urlencoded';
		req.write(data + '\r\n');
	}
	
	req.end();
	
}

function _get(ops, callback)
{
	_request(ops, null, function(err, buffer)
	{
		if(callback) callback(err, buffer ? JSON.parse(buffer) : buffer);
	});
}

function _copy(from, to)
{
	var cp = to || {};
	
	for(var prop in from)
	{
		cp[prop] = from[prop];
	}
	return cp;
}

var HttpConnection = Structr({
	
	'__construct': function(host, transport)
	{
		this._host = host;
		this._transport = transport;
		this._queue = new Queue(true);
		
		this.host = host.host;
		this.port = host.port;
		
		var self = this;
		
		
		var interval = setInterval(function()
		{
			self.up(function(err)
			{
				if(err)
				{
					console.notice('Http Connection %s has been disconnected.', self._host.host + ':' + self._host.port);
					transport._removeConnection(self);

					if(self.onExit) self.onExit();
					
					clearInterval(interval);
				}
			});

		}, 3000);
	},
	
	'up': function(callback)
	{
		this._get( { path: '/up' }, callback);
	},
	
	'ready': function(sib, callback)
	{
		this._get( { path: '/sibling/ready?host=' + sib.host + '&port=' + sib.port }, callback);
	},
	
	'addSibling': function(sib, callback)
	{
		this._get( { path: '/add/sibling?host=' + sib.host + '&port=' + sib.port }, callback);
	},
	
	'send': function(message)
	{
		var self = this;

		if(!this._batch)
		{
			this._batch = [];

			setTimeout(this.getMethod('_sendBatch'), 20);
		}

		this._batch.push(message);
	},

	'_sendBatch': function()
	{
		var batch = this._batch, self = this;

		this._batch = null;

		this._queue.add(function()
		{
		
			try
			{
				batch = JSON.stringify(batch); 
			}catch(e)
			{
				return console.error('Unable to send message because of a JSON stringify issue.');
			}
			self._post( { path: '/send?fromHost=' + self._transport._host.host +'&fromPort=' + self._transport._host.port }, batch, function(err, res)
			{
				self._queue.next();
			});
			
		});	
	},
	
	'_get': function(ops, callback)
	{	
		_get( _copy(this._host, ops), callback);
	},
	
	'_post': function(ops, data, callback)
	{
		ops.method = 'POST';
		_request( _copy(this._host, ops), data, callback);
	},
	
	'toJSON': function()
	{
		return this._host;
	},
	
	'onMessage': function()
	{
		//override me
	},

	'onExit': function()
	{
		
	}
});


var HttpTransport = Structr({
	
	'__construct': function(port)
	{
		this._host = { port: port || 36268 };
		this._siblings = [];
	},
	'connect': function(onConnection)
	{
		var self = this;
		this._onConnection = onConnection;
		
		exec('hostname', function(err, hostname)
		{
			self._host.host = hostname.replace('\n','');
			
			self._nextPorts = {};
			
			
			var srv = express.createServer();

			// srv.use(express.bodyParser());

			srv.post('/send', function(req, res)
			{
				req.setEncoding('utf8');

				var buffer = '',
					fromObj = { host: req.query.fromHost, port: Number(req.query.fromPort) },
					from = self._getConnection(fromObj);
				
				req.on('data', function(data)
				{
					buffer += data;
				});
				
				req.on('end', function()
				{
					if(from)
					{
						var batch = JSON.parse(buffer);

						for(var i = 0, n = batch.length; i < n;  i++)
						{
							from.onMessage(batch[i]);
						}
					}
					else
					{
						console.error('%s:%s cannot handle request from %s:%s', self._host.host, self._host.port, fromObj.host, fromObj.port);
					}

					res.send('Done');
				});

				req.on('error', function()
				{
					// console.log("ERR")
				})
				
			});
			
			srv.get('/up', function(req,res)
			{
				res.send({ message: 'YEEESSSS.' });
			});
			
			srv.get('/connect', function(req, res)
			{
				var host = req.query.host;
					
				if(!self._nextPorts[host]) self._nextPorts[host] = self._host.port;
				
				req.query.port = ++self._nextPorts[host];
				
				res.send(req.query);
			});
			
			srv.get('/sibling/ready', function(req, res)
			{
				self._siblings.forEach(function(sib)
				{
					sib.addSibling(req.query);
				});
				
				res.send(self._siblings.concat(self._host));
				
				self._addConnection(req.query);
			});
			
			srv.get('/add/sibling', function(req, res)
			{
				res.send(self._addConnection(req.query));
			});

			function init(host, master)
			{
				self._host = host;
				
				self._nextPorts[host.host] = host.port + 100; //nice big buffer for any clients in between
				
				srv.listen(host.port);
				
				if(master)
				{
					master.ready(host, function(err, siblings)
					{
						siblings.forEach(function(sib)
						{
							self._addConnection(sib);
						})
					})
				}
			}
			
			
			_get(_copy(self._host, { path: '/connect?host=' + self._host.host } ), function(err, result)
			{
				if(err)
				{
					init(self._host);
				}
				else
				{
					init(result, new HttpConnection(self._host, self));
				}
			});
			
		});
		
		return this;
	},
	'_getConnection': function(sib)
	{
		for(var i = this._siblings.length; i--;)
		{
			var s = this._siblings[i];
			if(s.host == sib.host && s.port == sib.port) return s;
		}
		return null;
	},	
	'_addConnection': function(sib)
	{ 
		sib.port = Number(sib.port);
		
		var ret;
		if(!(ret = this._getConnection(sib)))
		{
			ret = new HttpConnection(sib, this);
			
			this._onConnection(ret);
			
			this._siblings.push(ret);
		}
		
		return ret;
	},
	'_removeConnection': function(sib)
	{
		var i = this._siblings.indexOf(sib);
		
		if(i > -1) this._siblings.splice(i, 1);
	}
});

exports.connect = function(port, onConnection)
{
	if(!onConnection)
	{
		onConnection = port;
		port = undefined;
	}
	
	return new HttpTransport(port).connect(onConnection);
}
