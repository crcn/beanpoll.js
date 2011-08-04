var Structr = require('structr'),
Parser = require('./parser'),
utils = require('./utils'),
middleware = require('../middleware/meta'),
Request = require('./request'),
Collection = require('./collection');



/**
 * Glorious. 
 */

var Router = Structr({
	
	/**
	 * Constructor. What else do you think it is?
	 */

	'__construct': function(ops)
	{
		if(!ops) ops = {};

		this.RequestClass = ops.RequestClass || Request;
		this._collection = new Collection(ops);
	},

	/**
	 * listens to the given expression for any change
	 */

	'on': function(expr, callback)
	{
		return this._collection.add(expr, callback);
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
		var route = this._collection.route(expr);

		if(!data) data = {};
		
		data._params = route.data;

		return this._middleware().getRoute({
			expr: expr,
			data: data,
			listeners: this._filterRoute(expr, route.target)
		});
	},

	/**
	 */

	'dispatch': function(expr, data, ops, callback)
	{	
		if(data instanceof Function)
		{
			callback = data;
			data     = undefined;
			ops      = undefined;
		}

		if(ops instanceof Function)
		{
			callback = ops;
			ops     = undefined;
		}

		if(!ops) ops = {};
		if(!data) data = {};


		var inf = this.getRoute(expr, data);


		//warnings are good incase this shouldn't happen
		if(!inf.listeners.length)
		{
			if(!ops.ignoreWarning) console.warn('The %s route "%s" does not exist', expr.type, utils.pathToString(expr.channel.paths));

			//some callbacks are passive, meaning the dispatched request is *optional* ~ like a plugin
			if(expr.meta.passive && callback)
			{
				callback();
			}

			return;
		}


		var newOps = {

			//reference is good for calling middleware
			router: this,

			//data attached, duh. 
			data: inf.data,

			//the metadata attached to the expression. Tells all about how it should be handled
			meta: expr.meta,

			//where is the dispatch coming from? Useful for hooks
			from: ops.from || this.controller,

			//the listeners to dispatch
			listeners: inf.listeners,

			//the final callback after everything's done ;)
			callback: callback
		};


		//BLAH, more overhead >.>. 
		Structr.copy(newOps, new this.RequestClass(), true).init().next();


		//READY SET GO!
		// new this.RequestClass(ops).next();
	},

	/**
	 * filters routes based on metadata
	 */

	'_filterRoute': function(expr, route)
	{
		if(!route) return [ ];

		var listeners = (route.listeners || []).concat();


		//Useful if there are groups of listeners with the same channel, but should not communicate
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
	}
});



module.exports = Router;