var Structr = require('structr'),
	Proxy = require('../../index').Proxy,
	Bridge = require('../../proxy/router/bridge'),
	sys = require('sys'),
	Janitor = require('sk/core/garbage').Janitor;

/**                                                      
 * glues two remote proxies together
 */              

var GlueConnection = Structr({  

	/**
	 * @param proxy the proxy we're glueing to
	 * @param transport the remote connection between this app, and anything remote
	 */

	'__construct': function(connection, glue)
	{                         
		this._requests 	 = {};       
		this._glue  	 = glue;
		this._connection = connection;    
		this._proxy 	 = glue.proxy;
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
			if( true /*proxy.grantAccess(msg.name, (msg.data || {}).pullKey)*/)
			{
				if(msg.action == 'pull')
				{
					self._proxy.pull('-stream ' + msg.name, msg.data, { from: self._remoteProxy }, function(reader)
					{                 
						reader.on({
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
			  		self._proxy.push(msg.name, {}, { from: self._remoteProxy }, function(writer)
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
			var reader = self._requests[msg.uid];

			if(reader)
			{
				var method = reader.getMethod(msg.action)
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

		this.ignore(msg.name, false);
		       
     
	},

	/**
	 */

	'_start': function()
	{    
		var self = this,
		    oldPublish = this._proxy.push;


		function listenOn(type, listen, channel)
		{
			self._janitor.addDisposable(self._proxy.on(type+' '+listen+' '+channel, function(stream)
			{ 
				if(!self.ignore(channel))
				{
					self[type].apply(self, ['-stream ' + channel, stream.data, function(writer)
					{ 
						if(type == 'pull')
						{
							writer.pipe(stream);
						}
						else
						{
							stream.pipe(writer);
						}
					}]);
				}
			}));
		}

		function listenToChannel(channel, glue)
		{
			var listen = '-stream -glued -public -cluster=' + glue.cluster;

			if(channel.meta.rotate) listen += ' -rotate';
			if(channel.meta.multi) listen += ' -multi';

			self._onPush(channel.name);
			listenOn('push', listen, channel.name);

			self._onPull(channel.name);

			listenOn('pull', listen, channel.name);
		}

		//get all the channels so we can listen for them
		self.pull('glue', function(glue)
		{             
			self._reset();     

			self._remoteProxy.cluster = glue.cluster;

			var channels = [];
						  
			for(var i = glue.channels.length; i--;)
			{	
				try
				{	
					listenToChannel(glue.channels[i],  glue);

					channels.push(glue.channels[i].name)
				}
				catch(e)
				{
					//TODO: what if the server restarts?
					// if(channels[i] == 'add/thyme')
					// console.log(e.stack)
				}
				 
			}
			//just for debugging
			self._remoteProxy.channels = channels;
			                     
			self.ignore('glue/connection', true);      
			self._proxy.push('glue/connection', null, { from : self._remoteProxy }); 
			self.ignore('glue/connection', false);	
		});
	},
	


	/**   
	 * sends off a remote pull with a callback attached
	 */

	'_request': function(type, name, writer)
	{     
		//dirty UID
		var uid = this._uid(name), self = this;


		if(this._requests[uid])
		{
			console.warn('uid already exists!');
		}

		if(writer)
		{
			this._requests[uid] = writer;
			
			var kill = setTimeout(function()
			{
				delete self._requests[uid];

				console.error('%s glue request "%s" with uid "%s" was not handled. This should NOT happen!', type, name, uid);
			},60000);

			writer.on({
				end: function()
				{
					clearTimeout(kill);
				}
			})
		}

		this._send(type, name, writer ? writer.data : null , uid); 
		return uid;
	},

	/**
	 */

	'_uid': function(name)
	{
		var uid = name + '.' + new Date().getTime() + '.' + Math.round(Math.random() * 999999);

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
			appId: this._glue.appId,
			appKey: this._glue.appKey }, function()
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
		this._remoteProxy = new Proxy();

		this.push = this._remoteProxy.getMethod('push');
		this.pull = this._remoteProxy.getMethod('pull');

		this._onPull('glue');
	},

	'_onPull': function(channel)
	{
		var self = this;

		this._janitor.addDisposable(this._remoteProxy.on('pull -stream ' + channel, function(writer)
		{
			self._request('pull', channel, writer);

			
		}));
	},

	'_onPush': function(channel)
	{
		var self = this;


		this._janitor.addDisposable(self._remoteProxy.on('push -stream ' + channel, function(reader)
		{
			var uid = self._request('push', channel);

			reader.on({
				write: function(chunk)
				{
					self._send('write', channel, chunk, uid);
				},
				end: function()
				{
					self._send('end', channel, null, uid);
				}
			})
		}));
	},

	'ignore': function(name, value)
	{                                       
		return this._glue.ignore(name, value);
	}
});                                   

var RemoteGlue = Structr({

	 /**
	  */

	'__construct': function(transport, proxy)
	{
		this.proxy = proxy || new Proxy();
		this._ignoring = [];

		this._connections = [];
		
		var self = this;
		
		transport.connect(function(connection)
		{
			var con = new GlueConnection(connection, self);

			self._connections.push(con);

			con.onExit = function()
			{
				con._janitor.dispose();

				var i = self._connections.indexOf(con);

				self._connections.splice(i, 1);
				con.onExit = undefined;
			}
		});
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
	}

	/**
	 */

	/*'listen': function()
	{
		var self = this;

		this.proxy.on({
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

exports.RemoteGlue = RemoteGlue;