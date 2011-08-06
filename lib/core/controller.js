var Structr = require('structr'),
routeMiddleware = require('./middleware/route'),
metaMiddleware = require('./middleware/meta'),
Parser = require('./concrete/parser'),
Janitor = require('sk/core/garbage').Janitor,
utils = require('./concrete/utils');

var Controller = Structr({
	
	/**
	 */


	'__construct': function(target)
	{
		this.metaMiddleware = metaMiddleware(this);
		this.routeMiddleware = routeMiddleware(this);
		this._channels = {};
	},

	/**
	 */

	'has': function(type, ops)
	{
		var expr = this._parse(type, ops);
		return this._router(expr).hasRoute(expr);
	},

	/**
	 */

	'getRoute': function(type, ops)
	{
		var expr = this._parse(type, ops);
		return this._router(expr).getRoute(expr);
	},

	/**
	 */

	'on': function(target)
	{
		var ja = new Janitor();

		for(var type in target)
		{
			ja.addDisposable(this.on(type, {}, target[type]));
		}

		return ja;
	},

	/**
	 */

	'second on': function(type, callback)
	{
		this.on(type, {}, callback);
	},

	/**
	 */

	'third on': function(type, ops, callback)
	{
		var expr = this._parse(type, ops),
		router = this.routeMiddleware.router(expr);

		for(var i = expr.channels.length; i--;)
		{
			var pathStr = utils.pathToString(expr.channels[i].paths);

			if(!this._channels[pathStr])
			{
				this.addChannel(pathStr, expr.channels[i]);
			}
		}
		

		return router.on(expr, callback);
	},

	/**
	 */

	'channels': function()
	{
		return this._channels;
	},

	/**
	 */

	'addChannel': function(path, channel)
	{
		this._channels[path] = channel;
	},

	/**
	 * flavor picker for operations. In the string, or in the ops ;)
	 */

	'_parse': function(type, ops)
	{
		var expr = typeof type != 'object' ? Parser.parse(type) : type;
		
		if(ops)
		{
			if(ops.meta) Structr.copy(ops.meta, expr.meta);
			if(ops.type) expr.type = ops.type;
		}

		return expr;
	},

	/**
	 */

	'_router': function(expr)
	{
		return this.routeMiddleware.router(expr);
	},

	/**
	 */

	'_createTypeMethod': function(method)
	{
		var self = this;

		this[ method ] = function(type, data, ops, callback)
		{
			if(!ops) ops = {};
			ops.type = method;

			var expr = this._parse(type, ops);


			self._router(expr).dispatch(expr, data, ops, callback);
		}
	}
	
});

module.exports = Controller;