var Structr = require('structr');


var Middleware = Structr({

	/**
	 */

	'__construct': function(router)
	{
		this.router = router;

		//middleware specific to metadata
		this._toMetadata = {};

		//middleware which handles everything
		this._universal = {};
	},

	/**
	 */

	'add': function(module)
	{
		var self = this;

		if(module.all)
		{
			module.all.forEach(function(type)
			{	
				if(!self._universal[type]) self._universal[type] = [];

				self._universal[type].push(module);
			});
		}

		module.meta.forEach(function(name)
		{
			self._toMetadata[name] = module;	
		});
	},

	/**
	 */

	'getRoute': function(ops)
	{
		//parse metadata TO, and FROM
		var mw = this._getMW(ops.route._meta, 'getRoute').concat(this._getMW(ops.expr.meta));

		
		return this._eachMW(ops, mw, function(cur, ops)
		{
			return cur.getRoute(ops);
		});
	},

	/**
	 */

	'setRoute': function(ops)
	{
		var mw = this._getMW(ops.meta, 'setRoute');

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

	'_getMW': function(meta, uni)
	{
		var mw = (this._universal[uni] || []).concat();

		for(var name in meta)
		{
			var handler = this._toMetadata[name];

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