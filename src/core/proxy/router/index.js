var Structr = require('structr'),
Parser = require('./parser');


/*

Notes on developing this:

1. only one pass-thru can be fired off at a time, since they depend on the "next" to go onto the *next* passthru, or batch
2. At the end of the pass thru's, the listeners are fired off all at the same time. However, they might ALSO have passthru's, so *those* passthru's are 
fired off individually.

What if a channel has the exact same passthru? 

It's called as many times as they're defined. 
*/


/**
 * the request for the given channels. Yeah yeah... There are methods which look like wasted overhead, but it's designed to be
 * extendable. 
 */


var Request = Structr({
	
	/**
	 */

	'__construct': function(ops)
	{

		//the path used 
		this.path = ops.path;

		//the data passed to each listener
		this.data = ops.data || {};

		//metadata from the request
		this.meta = ops.meta || {};

		//where's the request coming from?
		this.from = ops.from;


		//need to go through these before firing the callback. optional
		this._thru = ops.thru;

		//listeners of the given channel
		this._listeners = ops.listeners;

		//the end callback which is fired after everything's done
		this._next = ops.next;
	},

	/**
	 * next callback
	 */

	'next': function(data)
	{
		//these get hit first in order.
		if(this._thru.length)
		{
			return this._init(this._thru.shift());
		}


		//then the listeners get it at the same time
		if(this._listeners)
		{
			var listeners = this._listeners;
			this._listeners = null;
			for(var i = listeners.length; i--;)
			{
				this._init(listeners[i]);	
			}

			return true;
		}

		//next should ONLY BE CALLED ONCE! It's actually a callback
		//which is past *by* the request while traversing through the listeners.
		//If next is called more than once, we could be hitting the same callback twice. Not good.
		if(this._next)
		{
			this._next();
			this._next = null;
			return true;
		}


		//nothing else to parse? return false for any potential pass-thrus. It's useful if they
		//know if the chain was nexted or not.
		return false;
	},


	/**
	 * prepares the callback before firing
	 */

	'_init': function(ops)
	{

		//params for the passthru? Fucking awesome. Apply them to the data-layer
		if(ops.params)
		for(var param in ops.params)
		{

			//also, remember that ops.params are mapped to the index of the URI
			this.data[param] = this.path[ ops.params[param] ].name;
		}
		
		//need to copy the items we need to pass thru since they're unshifted until we can continue 
		ops.thru = ops.thru.concat();

		//now the callback's ready, let's start calling shit. 
		this._passThru(ops);
	},

	/**
	 * need to pass thru the callback before firing it off
	 */

	'_passThru': function(ops)
	{
		//this happens if a pass thru is defined in the callback. like so:
		//router.on('authenticate/user -> get/user/mail'). Just recursively call the pass-thru methods
		//until there's no shit left to call.
		if(ops.thru.length)
		{
			var self = this;

			return this.router.dispatch(ops.thru.shift(), this.data, function()
			{	

				//back to the passthru with the same ops. DATA might have changed ;)
				self._passThru(ops);
			});
		}

		//no more callbacks to pass thru, so callback the final listener. but Blah, we're calling another
		//method in Request >.>. It's because this shit needs to be overridden incase the callback function changes, duh. 
		//Don't you want support for streaming content? HUH!?!?!?!?
		this._callback(ops);
	},

	/**
	 * final callback
	 */

	'_callback': function(ops)
	{

		//blah blah blah, stfu. Design > speed (in some cases). Damn I LOVE cappuccino's.
		//Can't work without my fucking cappuccino, or machiato. Cappuccino > machiato IMO, but that all depends if whether you get the milk right.
		//Shit's not right if your milk's not velvety, and sweet. No sugar bitch. Lactose at a certain temp tastes sweet. Don't oversteam that shit, 
		//otherwise you're milk will cook. 140 F, and take the fucking steam wand out, and you're good to go. Sprinkle coco on that shit. 
		ops.callback(this);
	}
	
});

/**
 * routes channel requests
 */

var Router = Structr({
	
	/**
	 * Constructor. What else do you think it is?
	 */

	'__construct': function(ops)
	{

		//the options for the router
		this._ops = ops || {};

		//these are the channels parsed into a traversable route
		this._routes = {};


		//!! this is an important flag. Note it, remember it. Allowing multiple 
		//callbacks changes the router's behaviour more to a pub/sub - oberserver behavior. Use it for 
		//PUSHING content to LISTENERS. In brazln, it's used for push, and pull-multi
		this._allowMultiple = !!this._ops.multi;
	},

	/**
	 * listens to the given expression for any change
	 */

	'on': function(expr, callback)
	{
		var channel = expr.channel,

			 paths = channel.paths,

			//start at the root, and work our way down.
			currentRoute = this._routes,

			//params, with a mapped index of where the param is in the URI / channel / path - call it whatever you want. 
			params = {};

		for(var i = 0, n = paths.length; i < n; i++)
		{
		 	var currentPath = paths[i],
		 	name = currentPath.name,
		 	isParam = currentPath.param;

		 	if(isParam)
		 	{

		 		//set the index for the parameter so we can map back to it.
		 		params[name] = i; 

		 		//name needs to be renamed to _param, which tells router to go through it *if* the current
		 		//channel path does not exist. 
		 		name = '_param';
		 	}

			if(!currentRoute[name])
			{
				currentRoute[name] = { _callbacks: [], _thru: [] };
			}

			currentRoute = currentRoute[name];
		}


		//unless specified (pull multi, or push) routes can only be set once.
		if((currentRoute._callbacks.length || currentRoute._thru.length) && !this._allowMultiple)
		{
			throw new Error('The path "'+this._pathToString(paths)+'" already exists');
		}

		//the targe callback
		var target = { params: params, 
			callback: callback, 
			meta: expr.meta,
			thru: this._passThrusToArray(channel) },

		//the callback can either *be* a callback, or a passthru. One or the other, but not both.
		stack = (channel.passThru ? currentRoute._thru : currentRoute._callbacks);

		stack.push(target);
		
		return {
			dispose: function()
			{
				var index = stack.indexOf(target);

				if(index > -1) stack.splice(index, 1);
			}
		}
	},


	/**
	 */

	'dispatch': function(expr, data, ops, next)
	{	
		if(typeof data == 'function')
		{
			next = data;
			data = undefined;
			ops = undefined;
		}

		if(typeof ops == 'function')
		{
			next = ops;
			ops = undefined;
		}

		if(!ops) ops = {};
		if(!data) data = {};


		//remove trailing backslashes or one too many.
		var paths = expr.channel.paths;


		var thru = [];

		var currentRoute = this._routes;
		
		for(var i = 0, n = paths.length; i < n; i++)
		{
			var path = paths[i].name;

			if(currentRoute._thru)
			{
				thru = thru.concat(currentRoute._thru);
			}

			currentRoute = currentRoute[path] || currentRoute._param;

			if(!currentRoute)
			{
				break;
			}
		} 

		this._getRequest({
			path: paths,
			thru: thru,
			data: data,
			meta: expr.meta,
			from: ops.from || this._from(),
			next: next,
			listeners: i == n ? currentRoute._callbacks : []
		}).next();
	},

	/**
	 * Overridable 
	 */

	'_getRequest': function(ops)
	{
		return new Request(ops);
	},

	/**
	 */

	'_pathToString': function(path)
	{
		var paths = [];

		for(var i = 0, n = path.length; i < n; i++)
		{
			var pt = path[i];

			paths.push(pt.param ? ':' + pt.name : pt.name);	
		}

		return paths.join('/');
	},

	/**
	 */

	'_from': function()
	{
		return this;
	},

	/**
	 */

	'_passThrusToArray': function(expr)
	{
		var cpt = expr.thru,
		thru = [];

		while(cpt)
		{
			thru.push(this._pathToString(cpt.paths));
			cpt = cpt.thru;
		}

		return thru;
	}
});


var MultiRouter = Router.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		if(!ops) ops = {};
		ops.multi = true;
		this._super(ops);
	}
})


exports.Parser  = Parser;
exports.Router  = Router;
exports.MultiRouter = MultiRouter;
exports.Request = Request;




