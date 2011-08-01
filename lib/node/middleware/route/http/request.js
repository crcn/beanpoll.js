var PullRequest = require('../../../../core/middleware/route/pushPull/pull/request');


var HttpRequest = PullRequest.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		this._super(ops);

		//OK by default
		this.statusCode = 200;

		//sent back to the client
		this.headers = {};

		//the http client
		this.req = ops.req || this.target.req;
	},

	/**
	 */

	'redirect': function(path)
	{
		// this.statusCode = 302;
		// this.headers['Location'] = url;
		// this.end();
	},

	/**
	 */

	 'session': function(callback)
	 {
	 	//todo
	 }

});

module.exports = HttpRequest;