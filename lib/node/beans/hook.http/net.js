var Structr = require('structr'),
	express = require('express'),
	http = require('http'),
	Url = require('url'),
	exec = require('child_process').exec,
	Queue = require('sk/core/queue').Queue,
	qs = require('querystring');
                            
/**
 * the transport between two proxies
 */


exports.request = function(ops, data, callback)
{
	if(typeof data == 'function')
	{
		callback = data;
		data = undefined;
	}

	if(!callback)
	{
		callback = function(){};
	}
	
	if(!ops.method) ops.method = 'GET';
	

	ops.connection = 'keep-alive';

	if(ops.data)
	{
		ops.path += '?' + qs.stringify(ops.data);
		delete ops.data;
	}
	
	ops.headers = { accept: '*/*' };

	ops.port = Number(ops.port)


	/**
		 
	var ops = {
		host:request.hostname,
		port:request.port,
		path:request.pathname+request.search,
		method:request.method,
		headers:request.headers,
		connection:'keep-alive'
	}
	*/


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
			var result = buffer;;

			try
			{
				result = JSON.parse(buffer);
			}
			catch(e){ }

			if(callback) callback(false, result);
		});
	});
	
	req.on('error', callback);
	
	
	if(ops.method != 'GET' && data)
	{
		ops.headers['content-length'] = (data || '').length;
		ops.headers['content-type'] = 'application/json';
		req.write(data);
	}
	
	req.end();
}

exports.get = function(ops, callback)
{
	exports.request(ops, null, function(err, result)
	{
		try
		{
			if(callback) callback(err, result);
		}
		catch(e)
		{
			console.error('cannot callback for %s', ops.path);
			console.error(e.stack);
		}
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
		this.isMaster = host.master;

		var self = this;



		function ping()
		{
			self.up(function(err)
			{
				if(err)
				{
					if(self.isMaster)
					{
						console.ok('Master is down, negotiating between siblings.');	

						transport.reconnect();

						self.disconnect();
					}
					else
					{
						self.disconnect();
					}
				}
				else
				{
					timeoutPing();
				}
			});
		}

		function timeoutPing()
		{
			//keep the ping random so siblings have a chance to race to being master.
			self._pingTimeout = setTimeout(ping, 3000);
		}
		
		timeoutPing();
	},
	
	/**
	 */

	'disconnect': function()
	{
		console.notice('Http Connection %s has been disconnected.', this._host.host + ':' + this._host.port);
		this._transport._removeConnection(this);

		if(this.onExit) this.onExit();
		clearTimeout(this._pingTimeout)
	},

	/**
	 */

	'up': function(callback)
	{

		this._get( { path: '/up' }, callback);
	},

	/**
	 */
	
	'ready': function(sib, callback)
	{
		this._get( { path: '/sibling/ready?host=' + sib.host + '&port=' + sib.port }, callback);
	},
	
	/**
	 */
	 
	'addSibling': function(sib, callback)
	{
		this._get( { path: '/add/sibling?host=' + sib.host + '&port=' + sib.port }, callback);
	},
	
	/**
	 */
	 
	'send': function(message, callback)
	{
		var self = this;


		if(!this._batch)
		{
			this._batch = [];
			this._callbacks = [];

			setTimeout(function(self){ self._sendBatch(); }, 20, self);
		}

		this._batch.push(message);
		this._callbacks.push(callback);
		return this;
	},

	/**
	 */
	 
	'reconnect': function()
	{
		this._get( { path: '/reconnect'} );
		return this;
	},

	/**
	 */
	 
	'_sendBatch': function()
	{
		var batch = this._batch, self = this,
		callbacks = this._callbacks;

		this._batch = null;
		this._callbacks = null;

		this._queue.add(function()
		{
			try
			{
				batch = JSON.stringify(batch); 
			}catch(e)
			{
				self._queue.next();
				return console.error('Unable to send message because of a JSON stringify issue.');
			}
			
			self._post( { path: '/send?fromHost=' + self._transport._host.host +'&fromPort=' + self._transport._host.port }, batch, function(err, res)
			{
				for(var i = callbacks.length; i--;)
				{
					if(callbacks[i]) callbacks[i](err, res);
				}


				self._queue.next();
			});
			
		});	
	},
	
	/**
	 */
	 
	'_get': function(ops, callback)
	{	
		_get( _copy(this._host, ops), callback);
	},
	
	/**
	 */
	 
	'_post': function(ops, data, callback)
	{
		ops.method = 'POST';
		_request( _copy(this._host, ops), data, callback);
	},

	/**
	 */
	
	'toJSON': function()
	{
		return this._host;
	},
	
	/**
	 */
	 
	'onMessage': function()
	{
		//override me
	},

	/**
	 */
	 
	'onExit': function()
	{
		
	}
});


var HttpTransport = Structr({
	
	'__construct': function(port)
	{
		this._masterHost = { port: port || 36268 };
		this._siblings = [];
	},

	/**
	 */

	'connect': function(onConnection)
	{
		var self = this;
		this._onConnection = onConnection;
		
		exec('hostname', function(err, hostname)
		{
			self._masterHost.host = hostname.replace('\n','');
			
			self.reconnect();
		});
		
		return this;
	},

	/**
	 */

	'reconnect': function()
	{
		var self = this;


		function onMasterCheck(host, master)
		{

			function onConnect()
			{
				if(master)
				{
					console.ok('Connecting to master http hook');

					master.ready(host, function(err, siblings)
					{
						if(err) 
						{
							return;
							// return console.error(err);
						}

						master.disconnect();

						siblings.forEach(function(sib)
						{
							self._addConnection(sib);
						})
					})
				}
				else
				{
					self._isMaster = true;
					console.ok('Running as master http hook');

					self._siblings.forEach(function(sib)
					{
						if(sib.port == host.port && sib.host == host.host) return;

						sib.reconnect().disconnect();
					});
				}
			}

			self._restartServer(host, master, onConnect);
		}


		_get(_copy(self._masterHost, { path: '/connect?host=' + self._masterHost.host } ), function(err, result)
		{
			//error? server's not up
			if(err)
			{
				onMasterCheck(self._masterHost);
			}
			else
			{
				onMasterCheck(result, new HttpConnection(self._masterHost, self));
			}
		});
	},

	/**
	 */

	'_restartServer': function(host, master, onConnect)
	{
		if(!this._nextPorts) this._nextPorts = {};


		if(this._server) return this._listen(host, master, onConnect);
		

		var srv = express.createServer(),
		self = this;


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

		srv.get('/reconnect', function(req, res)
		{
			console.ok('Reconnecting');

			self.reconnect();
			res.send('done');
		});
		
		srv.get('/add/sibling', function(req, res)
		{
			res.send(self._addConnection(req.query));
		});

		
		this._server = srv;

		this._listen(host, master, onConnect);
	},

	/**
	 */

	'_listen': function(host,master, onConnect)
	{
		this._host = host;
		this._nextPorts[host.host] = host.port + 100; //nice big buffer for any clients in between

		var self = this;

		function listen()
		{
			try
			{
				self._server.listen(host.port);

				host.master = !master;

				onConnect();
			}
			catch(e)
			{
				console.ok('Address in use, reconnecting http hook');

				setTimeout(function()
				{
					self.reconnect();
				}, 1000);
			}	
		}

		try
		{

			// console.log(this._)
			this._server.close();

			setTimeout(listen, 1000);
		}
		catch(e)
		{
			listen();	
		}

		
	},

	/**
	 */

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

		//make sure we're not duped.
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
