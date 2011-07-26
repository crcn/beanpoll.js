var Structr = require('structr'),
	Janitor = require('sk/core/garbage').Janitor,
	proxy  = require('./router/proxy'),
	PullRouter = proxy.PullRouter,
	PushRouter = proxy.PushRouter,
	Parser = proxy.Parser.Channel;



/**
 * The communication line between modules. Handles, push, and pull requests
 */



var sys = require('sys');

var Proxy = Structr({
	
	/**
	 */

	'__construct': function()
	{
		//some sugar
		this._p = new Parser();

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
		return this._channels
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

	'has': function(type)
	{
		var expr = this._p.parse(type);
			
		return this._router(expr).hasRoute(expr);
	},

	/**
	 */

	'on': function(listeners)
	{
		var ja = new Janitor();
		for(var type in listeners) ja.addDisposable(this.on(type, listeners[type]));
		return ja;
	},

	/**
	 */

	'1 on': function(type, callback)
	{
		var expr = this._p.parse(type),
			router = this._router(expr),
			pathStr = router._pathToString(expr.channel.paths)

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
		var expr = this._p.parse(type);

		this._router(expr).dispatch(expr, data, ops, callback);
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