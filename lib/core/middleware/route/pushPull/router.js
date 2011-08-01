var Router   = require('../../../base/router');

var PushPullRouter = Router.extend({
	
	/**
	 */

	'_from': function()
	{
		return this.controller;
	}
})


module.exports  = PushPullRouter;