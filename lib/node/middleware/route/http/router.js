var Router   = require('../../../../core/base/router'),
	HttpRequest = require('./request');


var HttpRouter = Router.extend({
	
	/**
	 */

	'_newRequest': function(ops)
	{
		return new HttpRequest(ops);
	}
});



module.exports = HttpRouter;
