var Structr = require('structr'),
Parser = require('./parser'),
utils = require('./utils'),
middleware = require('../middleware/meta'),
Request = require('./request');

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
		this._routes = this._newRoute();


		//!! this is an important flag. Note it, remember it. Allowing multiple 
		//callbacks changes the router's behaviour more to a pub/sub - oberserver behavior. Use it for 
		//PUSHING content to LISTENERS. In beanpole, it's used for push, and pull-multi
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
			params = {},

			middleware = this._middleware();

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
				currentRoute[name] = this._newRoute();
			}

			currentRoute = currentRoute[name];
		}


		//unless specified (pull multi, or push) routes can only be set once. loadbalance metadata can also be provided
		if((currentRoute._listeners.length || currentRoute._thru.length) && !this._allowMultiple && !middleware.allowMultiple(expr))
		{
			throw new Error('The path "'+this._pathToString(paths)+'" already exists');
		}

		//meta doesn't exist? add it. 
		if(!currentRoute._meta) currentRoute._meta = {};

		//copy the metadata over
		for(var type in expr.meta)
		{
			currentRoute._meta[type] = expr.meta[type];
		}

		//the targe callback
		var target = { params: params, 
			callback: callback, 
			meta: expr.meta,
			thru: this._passThrusToArray(channel) };

		if(target = middleware.setRoute(target))
		{
			//the callback can either *be* a callback, or a passthru. One or the other, but not both.
			var stack = (channel.passThru ? currentRoute._thru : currentRoute._listeners);

			stack.push(target);
		}
		

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
	
	'_newRoute': function()
	{
		return { _listeners: [], _thru: [] };
	},

	/**
	 */

	'_middleware': function()
	{
		return this.controller.metaMiddleware;
	},

	/**
	 */

	'hasRoute': function(expr, data)
	{
		return !!this.getRoute(expr, data).listeners.length;
	},


	/**
	 */

	'getRoute': function(expr, data)
	{
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
		

		return this._middleware().getRoute({ expr: expr, 
			router: this,
			route: currentRoute, 
			thru: thru, 
			data: data,
			path: paths, 
			listeners: this._filterRoute(expr, currentRoute) });
	},

	/**
	 */

	'dispatch': function(expr, data, ops, next)
	{	
		if(data instanceof Function)
		{
			next = data;
			data = undefined;
			ops = undefined;
		}

		if(ops instanceof Function)
		{
			next = ops;
			ops = undefined;
		}

		if(!ops) ops = {};
		if(!data) data = {};


		var inf = this.getRoute(expr, data);

		if(!inf.route && !ops.ignoreWarning)
		{
			console.warn('The %s route "%s" does not exist', expr.type, this._pathToString(inf.path));

			if(expr.meta.passive && next)
			{
				next();
			}

			return;
		}

		var newOps = {
			data: inf.data,
			next: next,
			path: inf.path,
			thru: inf.thru,
			meta: expr.meta,
			from: ops.from || this._from(),
			router: this, 
			route: inf.route || {},
			listeners: inf.listeners
		};

		Structr.copy(newOps, ops, true);


		this._newRequest(ops).next();
	},

	/**
	 */

	'_filterRoute': function(expr, route)
	{
		if(!route) return [ ];

		var listeners = (route._listeners || []).concat();

		//requests can have metadata which filters out routes we might not want.
		//this is especially useful if there are groups of listeners with the same channel, but should not communicate
		//with each other. E.g: two apps with slaves, sending queues to thyme. Thyme would need to know exactly where the slaves are
		for(var name in expr.meta)
		{

			//the value of the metadata to search
			var value = expr.meta[name];

			//make sure that it's not *just* defined
			if(value === 1) continue;
			
			//loop through the listeners and start filtering
			for(var i = listeners.length; i--;)
			{
				var listener = listeners[i];

				if(listener.meta[name] != value)
				{
					listeners.splice(i, 1);
				}
			}
		}

		return listeners;
	},


	/**
	 * Overridable 
	 */

	'_newRequest': function(ops)
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
		return this.controller;
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

module.exports = Router;