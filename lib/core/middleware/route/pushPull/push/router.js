var Router   = require('../../../../base/router'),
	PushRequest = require('./request');


var PushRouter = Router.extend({
	
	/**
	 */

	'_newRequest': function(ops)
	{
		return new PushRequest(ops);
	},

	/**
	 */

	'override on': function(expr, callback)
	{
		this._super(expr, callback);

		if(expr.meta.pull)
		{
			this.controller.pull(expr, null, { ignoreWarning: true }, callback);
		}
	}
});


module.exports = PushRouter;
