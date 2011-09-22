var Structr = require('structr'),
	Url = require('url'),
	net = require('./net'),
	qs = require('querystring'),
    vine = require('vine'),
    gumbo = require('gumbo'),
    Queue = require('sk/core/queue').Queue,
    EventEmitter = require('sk/core/events').EventEmitter;

function printError(msg)
{
	if(msg.errors) msg.errors.forEach(function(msg)
	{
		console.error(msg.message);
	});

	if(msg.warnings) msg.warnings.forEach(function(msg)
	{
		console.error(msg.message);
	})
}
     
 
exports.Connection = Structr({
	
	'__construct': function(ops, transport)
	{
		this._transport = transport;
		
		//host to the server: theurld.spice.io, 127.0.0.1, whatever really
		this.hostname = ops.hostname;

		//port to the hook
		this.port = ops.port;

		this.remoteId = ops.appId;

		//id of the connection
		this._id = transport.idGen.hash(ops.hostname + ops.port);

		//used to link 
		this.key = ops.key || transport.idGen.random();
	},

	/**
	 */

	'implicit id': {
		get: function()
		{
			return this._id;
		}
	},

	/**
	 */

	'updateHost': function(host)
	{
		// net.request()	
	},

	/**
	 */

	
	'connect': function(callbacks)
	{
		var self = this;

		//needed to make sure a batch doesn't get handled before another
		this._queue = new Queue(true);


		function onReady()
		{
			console.notice('Connected to %s', self.toString());

			self.timeoutPing();
			callbacks.success(vine.message('Success').result(true).end());
		}

		function onError()
		{
			callbacks.error(vine.error('Unable to connect to %s', self));
		}


		//need to set the remote ID so when the other hook does the same handshake, they get the correct
		//connection. 
		this._setRemoteId(function(err, response)
		{

			self.hook( self._transport.host, function(err, response)
			{
				if(err)
				{
					self.cannotConnect();
					onError();
					return console.error(err.message);
				}

				if(response.errors || !response.result)
				{
					console.error('Cannot hook into %s', self);
					if(response) console.error('Invalid Response: %s', response.result);

					self.cannotConnect();
					onError();
					return printError(response);
				}


				self.remoteKey = response.result.key;
				self.remotePid = response.result.pid;

				//no pid? Not meshed, it's bussed.
				self.bussed = !self.remotePid;

				onReady();
			});		
		});
	},

	/**
	 */

	'_setRemoteId': function(callback)
	{

		if(this.remoteId)
		{
			callback();
		}
		else
		{

			var self = this;

			this.up(function(err, response)
			{
				//set the remote id so when the other hook searches against
				self.remoteId = response && response.result ? response.result.id : null;


				callback();
			});
		}
	},
    
    /**
     */
     
    'hook': function(target, callback)
    {
        this._post({ path: '/hooks', data: target }, callback);
    },

	/**
	 * happens if a connection has been established, but the 
	 * server is down / not responding for whatever reason.
	 */

	'isDown': function()
	{
		this.disconnect();
	},

	/**
	 * happens if the connection cannot be established to boot
	 */

	'cannotConnect': function()
	{
		this.disconnect();
	},

	/**
	 */

	'timeoutPing': function()
	{
		if(this.disconnected) return;

		clearTimeout(this._pingTimeout);
		this._pingTimeout = setTimeout(function(self)
		{
			self.ping();
		}, 3000, this);
	},
    
	/**
	 */

	'ping': function()
	{
		if(this.disconnected) return;

		var self = this;

		this.up(function(err, response)
		{
			//if the host is up, but the ID returned is different, then the server crashed, SO, we need
			//to disconnect, and reconnect because it could be a different instance
			if(err || !response.result || response.result.id != self.remoteId)
			{
				self.isDown();
			}
			else
			{
				self.timeoutPing();
			}
		});
	},

	
	/**
	 */

	'disconnect': function()
	{
		this.disconnected = true;

		console.notice('Http Connection %s has been disconnected.', this.toString());

		this._transport.hooks.remove({ key: this.key });
    
		if(this.onExit) this.onExit();
		clearTimeout(this._pingTimeout);
	},

	/**
	 */

	'up': function(callback)
	{
		this._get( { path: '/hooks/up' }, callback);
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


			self._post( { path: '/hooks/' + self.remoteKey + '/send', data: self._transport.host }, batch, function(err, res)
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
		ops.host = this.hostname;
		ops.port = this.port;

		net.get(ops, callback);
	},
	
	/**
	 */
	 
	'_post': function(ops, data, callback)
	{
		ops.method = 'POST';

		ops.host = this.hostname;
		ops.port = this.port;


		net.request(ops, data, callback);
	},


	/**
	 */

	'toString': function()
	{
		return 'http://' + this.hostname + ':' + this.port;
	},

	/**
	 */

	'toJSON': function()
	{
		return {
			hostname: this.hostname,
			port: this.port,
			_id: this._id,
			key: this.key
		};
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



exports.Transport = EventEmitter.extend({
	
	/**
	 */

	'override __construct': function()
	{
		this._super();

		this._queue = [];
	},

	/**
	 */

	'updateHost': function(host)
	{
		host.appId  = this.id;
		this.host   = host;

		/*this.hooks.all(function(err, hooks)
		{
			for(var i = hooks.length; i--;)
			{
				hooks[i].updateHost(host);
			}
		});*/

		while(this._queue.length) this._queue.pop()();
	},


	/**
	 */

	'hook': function(host, callback)
	{
		if(!callback) callback = function(){};

		var self = this;

		function onReady()
		{
			//get the *real* hostname if localhost is provided
			if(host.hostname == 'localhost') hostname = self.host.hostname;

			if(!host.hostname || !host.port) return callback(vine.error('Host & port must be provided').end());

			//cannot connect to self!
			if(host.hostname == self.host.hostname && host.port === self.host.port)
			{
				return callback(vine.error('Cannot connect to self').send());
			}

			var search = { hostname: host.hostname, port: host.port };

			if(host.appId)
			{
				search = { $or: [search, { remoteId: host.appId }] };
			}

			self.hooks.findOne(search, function(err, item)
			{
				function onItem(err, con)
				{

					var data = con.toJSON();
					data.pid = process.pid;
					data.id = self.id;

					callback(vine.result(data).end());
				}


				//item exists? sweet, return that
				if(item)
				{

					//app ID does not exist OR current id is equal to the apps id? continue
					if(!host.appId || item.remoteId == host.appId)
					{
						return onItem(err, item);
					}

					//otherwise, the app ID is different, so target has probably respawned. Need to disconnect, and reconnect
					else
					{
						item.disconnect();
					}
				}
				

				self.hooks.insert(self.newConnection({ hostname: host.hostname, port: host.port, remoteKey: host.appId }), function(err, items)
				{
					var con = items[0];

					con.connect({
						success: function()
						{
							self.emit('connection', con);
							onItem(err, con);
						},
						error: function(api)
						{
							callback(api);
						}
					});
				});
			});	
		}

		if(self.host)
		{
			onReady();
		}
		else
		{
			this._queue.push(onReady);
		}
	},

	/**
	 */

	'plugin': function(router)
	{
        this._router = router;
        
		if(this._routes) this._routes.dispose();

		var col = this.hooks = gumbo.db().collection('hooks'), self = this;

		this.idGen = this.hooks.idGen;

		this.id = this.idGen.random();


		this._routes = router.on({
            
            'push -pull http/host': function(host)
            {
                self.updateHost(host);
            },
                
			/**
			 */

			'pull -api -method=GET hooks/up': function()
			{
				return vine.result({ id: self.id }).end();
			},

			/**
			 */

			'pull -api -method=GET hooks': function(request)
			{
				col.find({}, function(err, items)
				{
					vine.list(items).end(request);
				});
			},

			/**
			 */

			'pull -api -method=POST (hooks or hooks/add)': function(request)
			{
				var data = request.data, host, port;
                    


				if(typeof data == 'string')
				{
					host = data;
					data = {};
				}
				else
				{
					host = data.hostname;
					port = data.port;
                    data = {};
				}

				if(host.indexOf('://') == -1) host = 'http://' + host;

				var hostParts = Url.parse(host),
				hostname = hostParts.hostname;

				//the port we're connecting to
				if(!port) port = hostParts.port;


				var search = { hostname: hostname, port: port, appId: request.data.appId };

				self.hook(search, function(api)
				{
					request.end(api);
				});
			},

			/**
			 */

			'pull -api -method=DELETE hooks/:key/validate -> (hooks/:key or hooks/:key/remove)': function(request)
			{
				request.connection.disconnect();

				vine.result(true).end(request);	
			},

			/**
			 */

			'pull -api -method=GET hooks/:key/validate': function(request)
			{
				col.findOne({ key: request.data.key }, function(err, item)
				{
					if(!item)
					{
						console.warn('Hook %s does not exist', request.data.key);

						return vine.error('Hook %s does not exist', request.data.key).end(request);
					}

					request.connection = item;

					if(!request.next()) return vine.result(item).end(request);
				});
			},

			/**
			 */
			
			'pull -api -method=POST hooks/:key/validate -> hooks/:key/send': function(request)
			{
				if(!request.req) return vine.error('method only supports HTTP').end();

				
				var con = request.connection, req = request.req, buffer = '';

				req.on('data', function(data)
				{
					buffer += data;
				});
				
				req.on('end', function()
				{
					if(con)
					{
						var batch = JSON.parse(buffer);

						for(var i = 0, n = batch.length; i < n;  i++)
						{
							con.onMessage(batch[i]);
						}
					}
					else
					{
						console.error('%s:%s cannot handle request from %s:%s', self._host.host, self._host.port, fromObj.host, fromObj.port);
					}


					vine.result(true).end(request);
				});

				req.on('error', function()
				{
					// console.log("ERR")
				})
			}
		});
		
		return this;
	},

	/**
	 */

	'newConnection': function(ops)
	{
		return new exports.Connection(ops, this);
	}
});
