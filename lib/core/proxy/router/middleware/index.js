var Structr = require('structr');


var Middleware = Structr({

	/**
	 */

	'__construct': function(router)
	{
		this.router = router;

		this._mw = {};
	},

	/**
	 */

	'add': function(module)
	{
		var self = this;

		module.meta.forEach(function(name)
		{
			self._mw[name] = module;	
		})
	},

	/**
	 */

	'getRoute': function(ops)
	{
		//parse metadata TO, and FROM
		var mw = this._getMW(ops.route._meta).concat(this._getMW(ops.expr.meta));

		
		return this._eachMW(ops, mw, function(cur, ops)
		{
			return cur.getRoute(ops);
		});
	},

	/**
	 */

	'setRoute': function(ops)
	{
		var mw = this._getMW(ops.meta);

		return this._eachMW(ops, mw, function(cur, ops)
		{
			return cur.setRoute(ops);
		});
	},

	/**
	 */

	'allowMultiple': function(expr)
	{	
		var mw = this._getMW(expr.meta);


		for(var i = mw.length; i--;)
		{
			if(mw[i].allowMultiple) return true;
		}

		return false;
	},

	/**
	 */

	'_getMW': function(meta)
	{
		var mw = [];

		for(var name in meta)
		{
			var handler = this._mw[name];

			if(handler && mw.indexOf(handler) == -1) mw.push(handler);
		}

		return mw;
	},

	/**
	 */

	'_eachMW': function(ops, mw, each)
	{
		var cops = ops,
		newOps;


		for(var i = mw.length; i--;)
		{
			if(newOps = each(mw[i], cops))
			{
				cops = newOps;
			}
		}

		return cops;
	}

});


module.exports = function(router)
{
	var mw = new Middleware(router);

	//needs to be useable online = manual
	mw.add(require('./rotate'));
	mw.add(require('./intercept'));
	mw.add(require('./store'));

	return mw;
}