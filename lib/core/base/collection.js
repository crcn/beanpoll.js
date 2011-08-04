var Structr = require('structr'),
Parser = require('./parser'),
utils = require('./utils'),
middleware = require('../middleware/meta'),
Request = require('./request');


require('sk/node/log')





/**
 * collection for routes
 */

/**
 * IMPORTANT notes regarding this class
 * 1. you can have multiple explicit middleware (/path/*)
*/


var Collection = Structr({
	
	/**
	 * Constructor. What else do you think it is?
	 */

	'__construct': function(ops)
	{

		//the options for the router
		this._ops = ops || {};

		//these are the channels parsed into a traversable route
		this._routes = this._newRoute();

		//these get executed whenever there's a new "on"
		this._middleware = this._newRoute();

		//!! this is an important flag. Note it, remember it. Allowing multiple 
		//callbacks changes the router's behaviour more to a pub/sub - oberserver behavior. Use it for 
		//PUSHING content to LISTENERS. In beanpole, it's used for push, and pull-multi
		this._allowMultiple = !!this._ops.multi;

		//the current route index. increments on every route!
		this._routeIndex = 0;
	},

	/**
	 */

	'has': function(expr)
	{
		return !!this.route(expr).target;
	},

	/**
	 */

	'route': function(expr)
	{
		return this._route(expr.channel.paths);
	},

	/**
	 * listens to the given expression for any chandage
	 */

	'add': function(expr, callback)
	{
		var paths = expr.channel.paths,
		isMiddleware = expr.channel.isMiddleware,
		middleware = expr.channel.thru,

		//middleware isn't used explicitly. Rather, it's *injected* into the routes which ARE used. Remember that.
		//explicit middleware looks like some/path/*
		currentRoute = this._start(paths, isMiddleware ? this._middleware : this._routes);

		//IF the listener exists, and the 
		if(currentRoute.listeners && !this._allowMultiple)
		{
			throw new Error('Path already exists');
		}

		//some explicit middleware might already be defined, so we need to get the *one* to pass through. 
		var before = this._before(paths, currentRoute);


		if(middleware) this._endMiddleware(middleware).thru = before;

		//the final callback for the route
		var listener = {
			callback: callback,

			//metadata for the expression
			meta: expr.meta,

			//keeps tabs for later use (in request)
			id: 'r'+(this._routeIndex++),

			//this is a queue where the first item is executed first, then on until we reach the last item
			thru: middleware || before,

			path: paths
		};

		//at this point we can inject the listener into the current route IF it's middleware.
		if(isMiddleware) this._injectMiddleware(listener, paths);


		//now that we're in the clear, need to add the listener!
		if(!currentRoute.listeners) currentRoute.listeners = [];


		//now to add it. Please take remember, for MOST CASES, "_listeners" will only have one, especially for http / requests
		currentRoute.listeners.push(listener);


		//the return statement allows for the item to be disposed of
		return {
			dispose: function()
			{
				var i = currentRoute.listeners.indexOf(listener);
				if(i > -1) currentRoute.listeners.splice(i, 1);
			}
		}
	},

	/**
	 */
	
	'_endMiddleware': function(target)
	{
		var current = target || {};

		while(current.thru)
		{
			current = current.thru;
		}

		return current;
	},

	/**
	 * injects explicit middleware (/path/*) in all the routes which go through its path
	 */

	'_injectMiddleware': function(listener, paths)
	{
		//level is only important for 
		listener.level = paths.length;

		//need to go through *all* routes ~ even middleware, because middleware also have 
		//routes to pass through ~ Inception.
		var afterListeners = this._after(paths, this._routes).concat(this._after(paths, this._middleware));

		//go through ALL items to put before this route, but make sure the item we're replacing isn't higher
		//in the middleware chain, because higher methods will already *have* reference to this pass-thru
		for(var i = afterListeners.length; i--;)
		{
			var currentListener = afterListeners[i];

			var currentMiddleware = currentListener.thru,
			previousMiddleware = currentListener;

			while(currentMiddleware)
			{
				if(currentMiddleware.level != undefined)
				{
					if(currentMiddleware.level < listener.level)
					{
						previousMiddleware.thru = listener;
					}
					break;
				}

				previousMiddleware = currentMiddleware;
				currentMiddleware = currentMiddleware.thru;
			}
			
			if(!currentMiddleware) previousMiddleware.thru = listener;
		}
	},

	/**
	 * reveals routes which must come *before* a middleware
	 * after beats circular references
	 * TODO: following code is __ugly as fuck__.
	 */

	'_before': function(paths, after)
	{
		var current = this._middleware._route,
		listeners = [];

		for(var i = 0, n = paths.length; i < n; i++)
		{
			//this makes sure we don't get to the end for pass thrus
			if(current.listeners) listeners = current.listeners;

			 var path = paths[i],
			 newCurrent = path.param ? current._param : current[path.name];

			 if(!newCurrent || !newCurrent._route || !newCurrent._route.listeners) break;

			 current = newCurrent._route;

			 //this is a check against pass thrus to beat circular references. It *also* allows this: hello/* -> hello
			 if(current != after) listeners = current.listeners;
		}


		return listeners[0];
	},

	/**
	 * reveals everyhing that comes *after* a route (for pass-thru's)
	 */

	'_after': function(paths, routes)
	{
		return this._flatten(this._start(paths, routes));
	},

	/**
	 * returns the starting point of a route
	 */

	'_route': function(paths, routes, create)
	{
		var current = (routes || this._routes)._route,
		data = {}

		for(var i = 0, n = paths.length; i < n; i++)
		{

			var path = paths[i],
			name = path.param ? '_param' : path.name;

			if(!current[name] && create)
			{
				current[name] = this._newRoute(i);
			}

			if(current[name])
			{
				current = current[name];
			}
			else
			{
				current = current._param;

				if(current) data[i] = name;
			}


			if(!current) return null;

			current = current._route;
		}


		return { target: current, data: data };
	},

	/**
	 */

	'_start': function(paths, routes)
	{
		return this._route(paths, routes, true).target;
	},

	/**
	 */

	'_newRoute': function(level)
	{
		return { _route: { }, _level: level || 0 };
	},

	/**
	 * flattens all routes into a single array
	 */

	'_flatten': function(route)
	{
		var listeners = route.listeners ? route.listeners.concat() : [];

		
		for(var path in route)
		{
			listeners = listeners.concat(this._flatten(route[path]._route || {}));
		}

		return listeners;
	}
});


module.exports = Collection;