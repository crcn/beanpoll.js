var Request = require('../Request'),
	Structr = require('structr');


var EventEmitter = require('events').EventEmitter;

var PullRequest = Request.extend({
	
	/**
	 */

	'init': function()
	{
		this._em = new EventEmitter();
		this.response = {};

		this._listen(this.callback, this.meta);

		return this;
	},

	/**
	 */

	'on': function(listen)
	{
		for(var type in listen) this.on(type, listen[type]);
	},

	/**
	 */

	'second on': function(type, callback)
	{
		this._em.addListener(type, callback);
	},

	/**
	 */
	
	'respond': function(data)
	{
		this.response = Structr.copy(data, this.response, true);
	},
	

	/**
	 */

	'write': function(chunk)
	{
		if(this._ended) return;

		if(!this._sentResponse)
		{
			this._sentResponse = true;
			this._em.emit('response', this.response);
		}

		this._em.emit('write', chunk);
	},

	/**
	 */

	'end': function(chunk)
	{
		if(this._ended) return;

		if(chunk) this.write(chunk);

		this._ended = true;

		this._em.emit('end');
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
