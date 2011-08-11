var Request = require('../request'),
	Structr = require('structr');


var PullRequest = Request.extend({
	
	/**
	 */

	'override init': function()
	{
		this._super();

		this._listen(this.callback, this.meta);

		return this;
	},

	/**
	 */

	'override _callback': function()
	{
		var ret = this._super.apply(this, arguments);

		if(ret != undefined)
		{
			this.end(ret);
		}
	}
});


module.exports = PullRequest;
