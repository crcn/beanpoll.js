var Structr = require('structr'),
	express = require('express'),
	http = require('http'),
	Url = require('url'),
	exec = require('child_process').exec,
	Queue = require('sk/core/queue').Queue,
	net = require('./net'),
	qs = require('querystring'),
    benapole = require('beanpole'),
    vine = require('vine');
     
 
exports.Connection = Structr({
	
	'__construct': function(host, transport)
	{
		this._host = host;
		this._transport = transport;

		this._queue = new Queue(true);
		
		//host to the server: theurld.spice.io, 127.0.0.1, whatever really
		this.host = host.host;

		//port to the hook
		this.port = host.port;

		//the master hook for mesh topology. 
		this.isMaster = host.master;

		this.timeoutPing();
	},

	/**
	 */

	'isDown': function()
	{
		if(this.isMaster)
		{
			console.ok('Master is down, negotiating between siblings.');	

			transport.reconnect();

			this.disconnect();
		}
		else
		{
			this.disconnect();
		}
	},

	/**
	 */

	'timeoutPing': function()
	{
		clearTimeout(this._pingTimeout);
		this._pingTimeout = setTimeout(function(self)
		{
			self.ping();
		}, 3000, self)
	},

	/**
	 */

	'ping': function()
	{
		var self = this;

		this.up(function(err)
		{
			if(err)
			{
				self.isDown();
			}
			else
			{
				self.startPinging();
			}
		});
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

		this._get( { path: '/hooks/up' }, callback);
	},

	/**
	 */
	
	'ready': function(sib, callback)
	{
		this._get( { path: '/hooks/sibling/ready', data: sib }, callback);
	},
	
	/**
	 */
	 
	'addSibling': function(sib, callback)
	{
		this._get( { path: '/hooks/add/sibling', data: sib }, callback);
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
		net.get( Structr.copy(this._host, ops, true), callback);
	},
	
	/**
	 */
	 
	'_post': function(ops, data, callback)
	{
		ops.method = 'POST';

		net.request( Structr.copy(this._host, ops, true), data, callback);
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



exports.Transport = Structr({
	
	'__construct': function(port)
	{
		this._siblings = [];

	},

	/**
	 */

	'plugin': function(router)
	{
		if(this._routes) this._routes.dispose();

		this._routes = router.on({
			
			/**
			 */

			'pull -http -method=POST hooks/send': function()
			{
				
			},

			/**
			 */

			'pull -http -method=GET hooks/up': function()
			{
				return vine.message('YESSSSSSS').end();
			},

			/**
			 */

			'pull -http -method=POST (hooks or hooks/add)': function()
			{
				
			},

			/**
			 */

			'pull -http -method=POST hooks/:hookId/ready': function()
			{
				
			}
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


		net.get(Structr.copy(self._masterHost, { path: '/connect?host=' + self._masterHost.host }, true ), function(err, result)
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
