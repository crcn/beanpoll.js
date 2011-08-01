var Structr = require('structr');


var Middleware = Structr({

	/**
	 */

	'__construct': function(controller)
	{
		this._middleware = [];

		this._controller = controller;

		//instantiated routers
		this._routers = {};

		//types of routers
		this.types = [];
	},

	/**
	 */

	'add': function(module)
	{
		this._middleware.push(module);

		this.types = module.types.concat(this.types);
	},

	/**
	 */

	'router': function(expr)
	{
		for(var i = this._middleware.length; i--;)
		{
			//get the factory name. some middleware may return different routers depending on the expression metadata, such as pull -multi
			var mw = this._middleware[i], name = mw.test(expr);

			if(name) return this._router(mw, name);
		}

		return null;
	},

	/**
	 */

	'_router': function(tester, name)
	{
		return this._routers[ name ] || this._newRouter(tester, name);
	},

	/**
	 */

	'_newRouter': function(tester, name)
	{
		var router = tester.newRouter(name);

		router.type = name;
		router.controller = this._controller;

		this._routers[ name ] = router;

		return router;
	}
});


module.exports = function(controller)
{
	var mw = new Middleware(controller);

	//needs to be useable online = manual
	mw.add(require('./pushPull/push'));
	mw.add(require('./pushPull/pull'));

	return mw;
}