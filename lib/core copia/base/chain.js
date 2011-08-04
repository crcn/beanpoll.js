var Structr = require('structr');



var Chain = Structr({
	
	/**
	 */

	'__construct': function()
	{
		this._chain   = [];
		this._wait    = false;
		this._running = false;
	},

	/**
	 */

	'add': function(callback)
	{
		this._chain.push(callback);
		this._tryNext();
	},

	/**
	 */

	'unshift': function(callback)
	{
		this._chain.unshift(callback);
		this._tryNext();
	},

	/**
	 */

	'next': function()
	{
		if(!this._chain.length || this._wait) return false;

		this._wait = this._running = true;

		var callback = this._chain.shift(), self = this;

		callback(function()
		{
			self._wait = false;
			self.next();
		});
	},

	/**
	 */

	'_tryNext': function()
	{
		if(this._running && !this._wait)
		{
			this.next();
		}
	}
});

module.exports = Chain;