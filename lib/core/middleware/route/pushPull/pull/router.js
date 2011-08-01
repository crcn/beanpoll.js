var Router   = require('../../../../base/router'),
	PullRequest = require('./request');


var PullRouter = Router.extend({
	
	/**
	 */

	'_newRequest': function(ops)
	{
		return new PullRequest(ops);
	}
});



module.exports = PullRouter;
