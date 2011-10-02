var Structr = require('structr'),
EventEmitter = require('sk/core/events').EventEmitter,
Router = require('../../controller'),
Janitor = require('sk/core/garbage').Janitor,
cashew = require('cashew');


var Message = Structr({
	
	/**
	 */

	'__construct': function(name, manager)
	{
		this._name = name;
		this._manager = manager;
		this._data = {};
	},

	/**
	 */

	'action': function(value)
	{
		this._action = value;
		return this;
	},


	/**
	 */

	'data': function(value)
	{
		this._data = value;
		return this;
	},

	/**
	 */

	'send': function(action, value)
	{
		if(action)
		{
			this.action(action);
			this.data(value);
		}


		var self = this;

		this._manager._connection._target.send(Structr.copy(this._buildMessage()), function(err, result)
		{
			if(err)
			{
				self.onError(err);
			}
		});

		return this;
	},

	/**
	 */

	'onError': function(e) { },

	/**
	 */

	'_buildMessage': function()
	{
		return { name: this._name, action: this._action, data: this._data };
	}
})

//back and forth communication
var Transaction = Message.extend({
	
	/**
	 */

	'override __construct': function(name, uid, manager)
	{
		this._super(name, manager);

		this._uid = uid;
		this._manager = manager;

		var em = this._em = new EventEmitter(),
		oldDispose = this._em.dispose,
		self = this;

		this._em.dispose = function()
		{
			this.disposed = true;
			oldDispose.call(em);
			self.dispose();
		}
	},

	/**
	 */

	'override _buildMessage': function()
	{
		var message = this._super();
		message.uid = this._uid;
		return message;
	},

	/**
	 */

	'response': function(message)
	{
		this._em.emit(message.action, message.data);
		return this;
	},

	/**
	 */

	'on': function(listen)
	{
		for(var type in listen)
		{
			this.on(type, listen[type])
		}

		return this;
	},

	/**
	 */

	'second on': function(type, listener)
	{
		this._em.addListener(type, listener);
		return this;
	},

	/**
	 */

	'register': function()
	{
		this._manager._addTransaction(this);	
		return this;
	},

	/**
	 */

	'onError': function(e)
	{
		this._em.emit('error', e);
	},

	/**
	 */

	'disposeOn': function(type)
	{
		var self =this;
		return this.on(type, function()
		{
			self.dispose();
		});
	},

	/**
	 */

	'dispose': function()
	{
		if(!this._em.disposed) this._em.dispose();

		this._manager.remove(this._uid);
	}
}); 


var CommunicationManager = Structr({

	/**
	 */

	'__construct': function(connection)
	{
		this._connection = connection;

		this._liveTransactions = {};

		this._connection._target.onMessage = this.getMethod('onMessage');
		this._em = new EventEmitter();
        this._idGen = cashew.register('hook.core');
	},


	/**
	 */

	'message': function(name)
	{
		return new Message(name, this);
	},

	/**
	 */

	'on': function(listen)
	{
		for(var type in listen)
		{
			this._em.addListener(type, listen[type]);
		}	
	},

	/**
	 */

	'onMessage': function(message)
	{
		var trans = this._liveTransactions[ message.uid ];


		if(trans)
		{
			trans.response(message);
		}
		else
		{

			var msg;

			if(message.uid)
			{
				msg = this.request(message).action(message.action).data(message.data);
			}
			else
			{
				msg = this.message(message.name).action(message.action).data(message.data);
			}

			this._em.emit(msg._action, msg);
		}

		return false;
	},

	/**
	 */

	'onDisconnect': function(err)
	{
		for(var uid in this._liveTransactions)
		{
			var transaction = this._liveTransactions[uid];
			
			transaction.response({ action: 'error', data: 'unable to fullfill request' }).dispose();
		}	
	},

	
	/**
	 */
	
	'transaction': function(name)
	{
		return new Transaction(name, this._idGen.uid(), this).register();
	},

	/**
	 * response to transaction
	 */

	'request': function(message)
	{
		return new Transaction(message.name, message.uid, this);
	},

	/**
	 */
	
	'remove': function(uid)
	{
		var trans = this._liveTransactions[uid];
		delete this._liveTransactions[uid];
		return trans;
	},

	/**
	 */

	'_addTransaction': function(trans)
	{		
		this._liveTransactions[ trans._uid ] = trans;
	}
	
});

exports.thru = function(request, id)
{                     
	
	if(!request.inner.thru)
	{
			//where has the call gone through?
 		request.inner.thru = [];

 		//the key to the end pint
 		request.inner.origin = id;

 		if(!request.inner.key) request.inner.key = id;
 	}


 	if(request.inner.thru.indexOf(id) == -1)
 	{
 		//keep track of allll the servers we might go through
		request.inner.thru.push(id);
 	}

}


var RemoteInvoker = Structr({

	/**
	 */

	'__construct': function(connection)
	{
		this._janitor = new Janitor();
		this._connection = connection;
		this._hook = connection._hook;
		this.remote = Math.random();
 		

		this.sendHooks();

		this.reset();
	},

	/**
	 */

	'sendHooks': function()
	{
		var self = this;

		if(this._hookListener) this._hookListener.dispose();

		this._hookListener = this._connection._router.on('push -pull hook', { data: { all: this._connection._target.bussed } }, function(hook)
		{
			self._connection._transaction().send('hook', hook).dispose();
		});
	},

	/**
	 */

	'reset': function()
	{
        this._janitor.dispose();

		this._janitor.addDisposable(this._virtualRouter = new Router());
		this.push = this._virtualRouter.getMethod('push')
		this.pull = this._virtualRouter.getMethod('pull');

		var self = this;
	},


	'dispose': function()
	{
		if(this._hookListener) this._hookListener.dispose();
		this._janitor.dispose();
	},

	/**
	 */

	'hook': function(type, channel)
	{
		switch(type)
		{
			case 'push': return this._hookPush(channel);
			case 'pull': return this._hookPull(channel);
			default: return null;
		}
	},

	/**
	 */

	 '_hookPull': function(channel)
	 {
	 	var self = this;

	 	this._janitor.addDisposable(this._virtualRouter.on('pull -stream ' + channel, function(request)
	 	{
	 		//get direct ref to methods
	 		this.wrap();
	 		exports.thru(this, self._hook.id);

	 		var trans =  self._connection._transaction(this.channel);

	 		trans.send('pull', { hasNext: this.hasNext(), data: this.data, inner: this.inner } ).
	 		on({
	 			write: this.write,
	 			end: this.end,
	 			response: this.response,
	 			next: self._next(this)
	 		}).
	 		disposeOn('end');
	 	}));
	 },

	 '_hookPush': function(channel)
	 {
	 	var self = this;

	 	this._janitor.addDisposable(this._virtualRouter.on('push -stream ' + channel, function()
	 	{
	 		exports.thru(this, self._hook.id);

	 		var trans = self._connection._transaction(this.channel).
	 		send('push', { hasNext: this.hasNext(), inner: this.inner }).
	 		on({
	 			next: self._next(this)
	 		});

	 		this.pipe({
	 			write: function(chunk)
	 			{
	 				trans.send('write', chunk);
	 			},
	 			end: function()
	 			{
	 				trans.send('end').dispose();
	 			}
	 		})
	 	}));
	 },


	 '_next': function(request)
	 {
	 	return function(data)
	 	{
	 		Structr.copy(data.inner, request.inner);
			request.next();
	 	}
	 }
});

var LocalInvoker = Structr({
	
	/**
	 */

	'__construct': function(connection)
	{
		this._con     = connection;
		this._router  = connection._router;
		this._janitor = new Janitor();
	},

	/**
	 */

	'hook': function(type, channel, ops)
	{
		var self = this,
		remoteMethod = this._con._remote.getMethod(type);

		if(!ops) ops = {};
		if(!ops.meta) ops.meta = {};

		ops.meta.stream = true;

		this._janitor.addDisposable(this._router.on(type + ' ' + channel, ops, function(localRequest)
		{	
			//thru = remote
			if(this.inner.thru && !this.inner.bussed && (!self._con._target.bussed || (this.inner.thru.indexOf(self._con._remote.id) > -1)))
			{
				return;
			}

			var _next = this.hasNext() ? function()
			{
				localRequest.next();
			} : null;
			
			this.inner.meta = this.meta;

			remoteMethod(this.currentChannel, localRequest.data, { meta: { stream: true }, _next: _next, inner: this.inner }, function(remoteRequest)
			{
				if(type == 'pull')
				{
					remoteRequest.pipe(localRequest);
				}
				else
				{
					localRequest.pipe(remoteRequest);
				}
			});
		}));
	},

	/**
	 */

	'reset': function()
	{
		this._janitor.dispose();
	},

	/**
	 */

	'dispose': function()
	{
		this._janitor.dispose();
	},

	/**
	 */

	'push': function(trans)
	{
		this._router.push(trans._name, {}, { from: this._con._remote, meta: this._meta(trans, 'push'), _next: this._next(trans), inner: this._inner(trans) }, function(stream)
		{
			//after push, there will be a series of writes. registering the transaction makes the local router own it ~ redirects to here.
			trans.register().
			on(stream.wrap()).
			disposeOn('end');
		});
	},

	/**
	 */

	'pull': function(trans)
	{
		var self = this;

		this._router.pull(trans._name, trans._data.data, { from: this._con._remote, meta: this._meta(trans, 'pull'), _next: this._next(trans), inner: this._inner(trans)  }, function(request, err)
		{
			request.pipe({
				respond: function(response)
				{
					trans.send('respond',response);
				},
				write: function(chunk)
				{
					trans.send('write', chunk);
				},
				end: function(err)
				{
					trans.send('end');
					trans.dispose();
				}
			});
		});	
	},

	/**
	 */

	'_next': function(trans)
	{
		return trans._data.hasNext ? function()
		{
			trans.send('next', { inner: this.inner });
		} : null;
	},

	/**
	 */
	
	'_inner': function(trans)
	{	
		if(!trans._data.inner.thru)
		{
			console.log("a remote method doesn't have 'thru' provided");
		}

	 	exports.thru(trans._data, this._con._remote.id);


		var inner = trans._data.inner || {};

		inner.bussed = this._con._target.bussed;

		return inner;
	},

	/**
	 */

	'_meta': function(trans, type)
	{
		var inner = this._inner(trans),
		meta = inner.meta || {};

		//target needs to be removed incase it's set by a remote hook. This will only filter out routes that don't exist (it'll always fail)
		delete meta.target;

		//passive will cause an exception to be thrown
		delete meta.passive;

		//this is important to note, so process carefully. if the inner key is the same as the remote key, then
		//the call is going TO the bus, and possibly to another hook. IF the hook is calling back to the original target, it has to go back THROUGH
		//the bus. IF key != remote, then we need to go to add meta which filters out to the original target (another hook)
		if(inner.key != this._con._remote.id && this._router.has(trans._name, { type: type, meta: { target: inner.key }})) //or check if bussed
		{
			meta.target = inner.key;
		}

		meta.stream = 1;


		return meta;
	}
})


/**
 * brings remote, and local together.
 */

 var Connection = Structr({
 	
 	/**
 	 */

 	'__construct': function(target, hook)
 	{

 		//the target connection
 		this._target = target;

 		//the hook which handles connections - owns this one.
 		this._hook = hook;

 		//global router
 		this._router = hook._router;

 		//handles conversation between two servers
 		this._comm = new CommunicationManager(this);

 		//cleanes up routes after disconnect
 		this._janitor = new Janitor();

 		//handles local invocation
 		this._local = new LocalInvoker(this).wrap();

 		//handles remote invocation
 		this._remote = new RemoteInvoker(this);

 		this.janitor = new Janitor();

 		//listen for remote pulls / pushes
 		this._comm.on({
 			push: this._local.push,
 			pull: this._local.pull,
 			hook: this.getMethod('onHook'),
 		});

 		this._onClose();
 	},

 	/**
 	 */

 	'_onClose': function()
 	{
 		var self = this;

		this._target.onExit = function(err)
		{
			self._comm.onDisconnect();
			self.dispose();
		}
 	},

 	/**
 	 */

 	'sendHooks': function()
 	{
 		this._remote.sendHooks();
 	},


 	/**
 	 * hooks the connection the remote connection
 	 */

 	'onHook': function(trans)
 	{	
 		var data = trans._data;

 		switch(data.method)
 		{
 			case 'list':                                      
				 
 				 this._addChannels(data.result); 
 			break;
 			case 'add':
 				this._addChannel(data.result);
 			break;
 		}

 	},

 	/**
 	 */

 	'_addChannels': function(result)
 	{
 		this._reset();

 		this._remoteInfo = result;

 		for(var i = result.channels.length; i--;)
		{
			try
			{
				this._listen(result.channels[i], result);
			}
			catch(e)
			{    
				console.log(e.message)                          
			}
		}

 		this._connected();
 	},


 	/**
 	 */

 	'_addChannel': function(channel)
 	{
 		if(!this._remoteInfo) return;


		try
		{
 			this._listen(channel, this._remoteInfo);
 		}catch(e)
 		{
 			
 		}
 	},

 	/**
 	 */

 	'hook': function(type, path, ops)
 	{
 		this._remote.hook(type, path, ops);
 		this._local.hook(type, path, ops);
 	},

 	/**
 	 */
 	
 	'_connected': function()
 	{
 		if(this._dispatchedConnected) return;
 		this._dispatchedConnected = true;

 		this._router.push('hook/connection', null, { from: this._remote });
 	},

 	/**
 	 */


 	'_listen': function(channel, hook)
 	{
 		var ops = { meta: Structr.copy(channel.meta || {}) },
 		meta = ops.meta;

 		ops.meta.pull = ops.meta.rotate = ops.meta.bussed = undefined;

 		ops.meta.stream = ops.meta.hooked = ops.meta.overridable = ops.meta['public'] = 1;

 		ops.meta.unfilterable = true;

 		//bussed items get re-broadcasted out
 		if(this._target.bussed)
 		{
 			ops.meta.bussed = 1;
 		}

 		meta.target = this._remote.id = hook.id;

 		this.hook('push', channel.path, ops);          
                                          

 		var route = this._router.getRoute('pull /' + channel.path, ops);


 		if(route && route.route && route.route.meta)
 		{	
 			if(route.route.meta.hooked == undefined && !route.router._allowMultiple)
			{ 
				return;
				// return console.warn('local channel %s exists. Cannot hook remote channel.', channel.path);
			}
 		}

 		this.hook('pull', channel.path, ops);
 	},

 	/**
 	 */

 	'_reset': function()
 	{
 		this._remote.reset();
 		this._local.reset();
 	},

 	/**
 	 */

 	'dispose': function()
 	{
 		this._remote.dispose();
 		this._local.dispose();
 		this.janitor.dispose();

 	},

 	/**
 	 */

 	'_response': function(message)
 	{
 		return this._comm.response(message);
 	},

 	/**
 	 */

 	'_transaction': function(name)
 	{
 		return this._comm.transaction(name); 
 	},

 	/**
 	 */

 	'_message': function(name)
 	{
 		return this._comm.message(name);
 	}
 });



 var Hook = Structr({
 	
 	/**
 	 */

 	'__construct': function(transport, router)
 	{
 		this._router = router;
 		this._transport = transport;

 		if(!transport.test) transport.test = function(){ return false; };

 		var connections = this._connections = [],
 		self = this;
 		
 		//listen for when a client connects 
 		transport.connect(function(connection)
 		{
 			var con = new Connection(connection, self);
 			connections.push(con);
 			
 			con.janitor.addDisposable({
 				dispose: function()
 				{
 					var i = connections.indexOf(con);
 					if(i > -1) connections.splice(i, 1);
 				}
 			});

 		});
 	},

 	/**
 	 */

 	'test': function(host)
 	{
 		return this._transport.test(host);
 	},

 	/**
 	 */

	'hook': function(host)
	{
		return this._transport.hook(host);
	},

 	/**
 	 */

 	'sendHooks': function()
 	{
 		for(var i = this._connections.length; i--;)
 		{
 			this._connections[i].sendHooks();
 		}
 	}
 });

module.exports = Structr.copy(module.exports, Hook, true);