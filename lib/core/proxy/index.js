var Structr = require('structr'),
	Janitor = require('sk/core/garbage').Janitor,
	proxy  = require('./router/proxy'),
	PullRouter = proxy.PullRouter,
	PushRouter = proxy.PushRouter,
	Parser = proxy.Parser,
	middleware = require('./router/middleware');



/**
 * The communication line between modules. Handles, push, and pull requests
 */



var sys = require('sys');

var Proxy = Structr({
	
	/**
	 */

	'__construct': function()
	{

		this.middleware = middleware();

		//responds to any requests for data
		this._pullRouter = new PullRouter({ proxy: this });

		//pushes data if anything changes
		this._pushRouter = new PushRouter({ multi: true, proxy: this/*, ignoreWarning: true*/ });

		//same as pull, but allows for multiple handlers. use it as such:
		//proxy.pullMulti('get.system.stats', function(stats)...
		this._pullMultiRouter = new PullRouter({ multi: true, proxy: this });

		this._channels = {};

		var self = this;
	},

	/**
	 */

	'channels': function()
	{
		return this._channels;
	},

	/**
	 */

	'push': function(type, data, ops, callback)
	{
		this._request('push ' + type, data, ops, callback);
	},

	/**
	 */

	'pull': function(type, data, ops, callback)
	{
		this._request('pull ' + type, data, ops, callback);
	},

	/**
	 */

	'pullMulti': function(type, data, ops, callback)
	{
		this._request('pull -multi ' + type, data, ops, callback);
	},

	/**
	 */

	'has': function(type, ops)
	{
		var expr = this._parseOps(type, ops);
			
		return this._router(expr).hasRoute(expr);
	},

	/**
	 */

	'getRoute':function(type, ops)
	{
		var expr = this._parseOps(type, ops);
			
		return this._router(expr).getRoute(expr);
	},
	
	/**
	 */

	'on': function(listeners)
	{
		var ja = new Janitor();
		for(var type in listeners) ja.addDisposable(this.on(type, {}, listeners[type]));
		return ja;
	},

	/**
	 */

	'1 on': function(type, callback)
	{
		return this.on(type, {}, callback);
	},

	/**
	 */

	'2 on': function(type, ops, callback)
	{
		var expr = this._parseOps(type, ops),
			router = this._router(expr),
			pathStr = router._pathToString(expr.channel.paths)

		//fix me: why the well is this here? Shouldn't be here. check if it exists 
		if(expr.meta.multi) pathStr = ' -multi ' + pathStr;

		if(!this._channels[pathStr])
		{
			this.addChannel(pathStr, expr);
		}

		var disposable = router.on(expr, callback);


		//allow for push handlers to pull data as they're defined
		if(expr.type == 'push' && expr.meta.pull)
		{
			(expr.meta.multi ? this._pullMultiRouter : this._pullRouter).dispatch(expr, null, { ignoreWarning: true },  callback);
		}

		return disposable;
	},

	/**
	 */

	'addChannel': function(path, expr)
	{
		this._channels[path] = expr;
	},


	/**
	 */

	'_request': function(type, data, ops, callback)
	{
		var expr = this._parseOps(type, ops);
		
		this._router(expr).dispatch(expr, data, ops, callback);
	},


	/**
	 * flavor picker for operations. In the string, or in the ops ;)
	 */

	'_parseOps': function(type, ops)
	{
		var expr = Parser.parse(type);

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
		if(expr.type == 'pull')
		{
			return expr.meta.multi ? this._pullMultiRouter : this._pullRouter;
		}
		else
		{
			return this._pushRouter;
		}
	}
});


exports.Proxy = Proxy;