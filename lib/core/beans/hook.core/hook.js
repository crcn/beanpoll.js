var Structr = require('structr'),
	Router = require('../../controller'),
	sys = require('sys'),
	Janitor = require('sk/core/garbage').Janitor,
	utils = require('../../../core/concrete/utils');

/**                                                      
 * hooks two remote proxies together. shit's really fugly.
 */              

var HookConnection = Structr({  

	/**
	 * @param router the router we're hooking to
	 * @param transport the remote connection between this app, and anything remote
	 */

	'__construct': function(connection, hook)
	{                         
		this._requests 	 = {};       
		this._hook  	 = hook;
		this._connection = connection;    
		this._router 	 = hook.router;
		this._janitor 	 = new Janitor();

		//override the message
		connection.onMessage = this.getMethod('handleMessage');
		connection.onExit = this.getMethod('onExit');

		this._reset();
		this._start();    
	},

	/**
	 * handles the message passed from the transport
	 */

	'handleMessage': function(msg)
	{                          
		
		var self = this, open = 0;  

		//what didn't go through?
		/*for(var i in self._requests)
		{
			open++;
		}*/


		// console.log(open)
		// console.log('msg: '+msg.action+" "+msg.uid);

		//ignores sending out to remote transports. Fixes infinite loop problems    
		this.ignore(msg.name, true);	

		if(msg.action == 'pull' || msg.action == 'push')
		{
			//make sure the pull is not protected before making it
			if( true /*router.grantAccess(msg.name, (msg.data || {}).pullKey)*/)
			{
				var _next;

				if(msg.data.hasNext)
				{
					_next = function()
					{
						self._send('next', msg.name, null, msg.uid);
					};
				}

				if(msg.action == 'pull')
				{
					self._router.pull(msg.name, msg.data.data, { meta: { stream: 1}, from: self._remoteRouter, _next: _next }, function(request)
					{                 
						request.pipe({
							write: function(chunk)
							{
								self._send('write', msg.name, chunk, msg.uid);
							},
							end: function()
							{
								self._send('end', msg.name, null, msg.uid);
							}	
						});

					}, self);
				}
				else
				{
			  		self._router.push(msg.name, {}, { from: self._remoteRouter, _next: _next  }, function(writer)
			  		{
			  			self._requests[msg.uid] = writer;
			  		});
				}
			}
			else
			{
				self._send('response', msg.name, 'You cannot call ' + msg.name + '.', msg.uid, req);
			}
		}   
		else
		if(msg.action == 'write' || msg.action == 'end')
		{
			var request = self._requests[msg.uid];

			if(request)
			{
				var method = request.getMethod(msg.action)
				method(msg.data);
			}
			else
			{
				console.warn('Missed %s, call %s for %s. This shouldn\'t happen...', msg.action, msg.name, msg.uid);
			}

			if(msg.action == 'end')
			{
				delete this._requests[msg.uid];
			}
		}    
		else
		if(msg.action == 'next')
		{
			var request = self._requests[msg.uid];

			if(request)
			{
				request.next();
			}
			else
			{
				console.warn('Cannot continue to next route for %s because the request does not exist.', msg.name);
			}
			delete self._requests[msg.uid];
		}

		this.ignore(msg.name, false);
		       
     
	},

	/**
	 */

	'_start': function()
	{    
		var self = this,
		    oldPublish = this._router.push;


		function listenOn(type, ops, channel)
		{
			self._janitor.addDisposable(self._router.on(type+" "+channel, ops, function(stream)
			{ 
				if(!self.ignore(channel))
				{
					var request = this;

					var meta = { stream: 1 },
					_next = this.hasNext() ? function()
					{
						request.next();
					} : null;
				
					self[type].call(self, channel, stream.data, { meta : meta, _next: _next }, function(writer)
					{ 

						if(type == 'pull')
						{
							writer.pipe(stream);
						}
						else
						{
							stream.pipe(writer);
						}
					});
				}
			}));
		}

		function listenToChannel(channel, hook)
		{
			var ops = {};
			
			if(channel.meta.rotate) delete channel.meta.rotate;
			if(channel.meta.pull) delete channel.meta.pull;

			ops.meta = Structr.copy(channel.meta);
			ops.meta.stream =  ops.meta.hooked = ops.meta.rotate = ops.meta.overridable = ops.meta['public'] = 1;
			if(hook.cluster) ops.meta.cluster = hook.cluster;

			// if(ops.meta.multi) console.l
			self._on('push', channel.path);
			listenOn('push', ops, channel.path);

			// console.log(channel.path);

			var route = self._router.getRoute('pull '+channel.path, ops);
			

			//this could be problematic if we're working with round-robin
			if(route && route.route && route.route._meta)
			{
				if(route.route._meta.hooked == undefined && !route.router._allowMultiple)
				{
					return console.warn('local channel %s exists. Cannot hook remote channel.', channel.path);
				}
			}

			self._on('pull', channel.path)
			listenOn('pull', ops, channel.path);
		}

		//get all the channels so we can listen for them
		self.pull('hook', function(hook)
		{             
			self._reset();     

			self._remoteRouter.cluster = hook.cluster;

			var channels = [];
						  
			for(var i = hook.channels.length; i--;)
			{	
				try
				{	
					listenToChannel(hook.channels[i],  hook);

					channels.push(hook.channels[i].path)
				}
				catch(e)
				{
				}
				 
			}

			//just for debugging
			self._remoteRouter.channels = channels;
			                     
			self.ignore('hook/connection', true);      
			self._router.push('hook/connection', null, { from : self._remoteRouter }); 
			self.ignore('hook/connection', false);	
		});
	},
	


	/**   
	 * sends off a remote pull with a callback attached
	 */

	'_request': function(type, name, request)
	{     
		//dirty UID
		var uid = this._uid(name), self = this;


		if(this._requests[uid])
		{
			console.warn('uid already exists!');
		}

		if(request)
		{
			this._requests[uid] = request;
			
			if(type == 'pull' || request.hasNext())
			{
				var kill = setTimeout(function()
				{
					delete self._requests[uid];

					if(type == 'pull')
					console.error('%s hook request "%s" with uid "%s" was not handled. This should NOT happen!', type, name, uid);
				},60000);

				request.on({
					end: function()
					{
						clearTimeout(kill);
					}
				});
			}
			
		}

		this._send(type, name, { hasNext: request.hasNext(), data: request ? request.data : null } , uid); 

		return uid;
	},

	/**
	 */

	'_uid': function(name)
	{
		var uid = name.replace(/\/+/g,'.') + '.' + new Date().getTime() + '.' + Math.round(Math.random() * 999999);

		//this happens more often than you might think :P
		while(this._requests[uid]) uid = this._uid(name);

		return uid;
	},

	/**
	 * sends a message off to the transport
	 */

	'_send': function(action, name, data, uid)
	{
		this._connection.send({ 
			action: action, 
			name: name, 
			data: data, 
			uid: uid,
			appId: this._hook.appId,
			appKey: this._hook.appKey }, function()
		{
			// console.log("send: "+action+" "+uid);
		});
	},


	'_error': function(action, name, error, uid, transport)
	{
		this._connection.send({ 
			action: action, 
			name: name, 
			error: error, 
			uid: uid });
	},

	'_reset': function()
	{
		this._janitor.dispose();

		this._remoteRouter = new Router();

		// this._remoteRouter.middleware.add(require('./middleware/hook'))

		this.push = this._remoteRouter.getMethod('push');
		this.pull = this._remoteRouter.getMethod('pull');

		this._onPull('hook');
	},

	'_on': function(type, channel)
	{
		if(type == 'pull')
		{
			this._onPull(channel)
		}
		else
		{
			this._onPush(channel)
		}
	},

	'_onPull': function(channel)
	{
		var self = this;
		this._janitor.addDisposable(this._remoteRouter.on(channel, { type: 'pull', meta: {stream:1}}, function()
		{
			self._request('pull', utils.pathToString(this.current.path), this);
		}));
	},

	'_onPush': function(channel)
	{
		var self = this;

		this._janitor.addDisposable(self._remoteRouter.on(channel, { type: 'push', meta: { stream: 1 }}, function()
		{
			var ch = utils.pathToString(this.current.path);

			var uid = self._request('push', ch, this);

			this.pipe({
				write: function(chunk)
				{
					self._send('write', ch, chunk, uid);
				},
				end: function()
				{
					self._send('end', ch, null, uid);
				}
			})
		}));
	},

	'ignore': function(name, value)
	{                                       
		return this._hook.ignore(name, value);
	}
});                                   

var RemoteHook = Structr({

	 /**
	  */

	'__construct': function(transport, router)
	{
		this.router = router || new Router();
		this._ignoring = [];
		this._nexts = {};

		this._connections = [];
		
		var self = this;
		
		transport.connect(function(connection)
		{
			var con = new HookConnection(connection, self);

			self._connections.push(con);

			con.onExit = function()
			{
				con._janitor.dispose();

				var i = self._connections.indexOf(con);

				if(i > -1) self._connections.splice(i, 1);
			}
		});


		this.init();
	},

	/**
	 */

	'ignore': function(name, value)
	{
		if(!this._ignoring) this._ignoring = [];
		var i = this._ignoring.indexOf(name);

		if(value == undefined) return i > -1;

		if(!value && i > -1)
		{
			this._ignoring.splice(i, 1);
		}                             
		else
		if(value && i == -1)
		{
			this._ignoring.push(name);
		}
	},

	/**
	 */

	'init': function()
	{
		var self = this;
	}

	/**
	 */

	/*'listen': function()
	{
		var self = this;

		this.router.on({
			'push -pull app/id': function(data)
			{
				self.appId = data.id;
			},
			'push -pull app/key': function(data)
			{
				self.appKey = data.key;
			}
		})
	}*/
	
	
});

exports.RemoteHook = RemoteHook;