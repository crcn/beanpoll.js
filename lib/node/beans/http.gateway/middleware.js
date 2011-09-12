var Structr = require('structr');


module.exports = Structr({
	
	/**
	 */

	'__construct': function()
	{
		this._middleware = [];
	},

	/**
	 */

	'add': function(mw)
	{
		this._middleware.push(mw);
	},

	/**
	 */

	'request': function(ops, next)
	{
		var queue = this._middleware.concat(next);

		//queue it up. Cute huh?
		(function next()
		{
			queue.shift()(ops, next);
		})();
	}
});