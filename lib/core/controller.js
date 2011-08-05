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


		//need to also account for the middleware. Need to make sure not to have any dupes though, even for multi-calls. Multi-calls
		//will hit all listeners anyways on the hook, so assigning multiple multi-calls would be a bad thing. it would be: N * N calls vs N * 1
		if(this.getRoute(type, ops).listeners.length < 2)
		{
			this.addChannel(utils.channelToStr(expr,{meta:1}), expr);
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

	'addChannel': function(channel, expr)
	{
		this._channels[channel] = { path: utils.pathToString(expr.channel.paths), expr: expr };
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