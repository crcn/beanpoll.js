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
		return this._tryNext();
	},

	/**
	 */

	'unshift': function(callback)
	{
		this._chain.unshift(callback);
		return this._tryNext();
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

		return true;
	},

	/**
	 */

	'child': function()
	{
		var chain = new Chain(), self = this;

		//need to wait for the child to finish before continueing 
		self.add(function(next)
		{
			chain.add(function()
			{
				next();
			});
		});

		return chain;
	},

	/**
	 */

	'_tryNext': function()
	{
		if(this._running && !this._wait)
		{
			this.next();
		}
		return this;
	}
});

module.exports = Chain;