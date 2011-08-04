var Bridge  = require('../bridge'),
	Request = require('../../../../base/request'),
	Structr = require('structr');


var EventEmitter = require('events').EventEmitter;

var PullRequest = Request.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		this._super(ops);

		this._em = new EventEmitter();

		//only used by the root
		this._reader = ops.callback;
		
	},

	/**
	 */

	'override next': function()
	{
		if(this._isWriting) return false;


		return this._super();
	},

	/**
	 */

	'_callback': function(callback)
	{
		var ret = callback.apply(this, [this.data, this]);

		if(ret != undefined)
		{
			this.end(ret);
		}
	},

	/**
	 */

	'on': function(listen)
	{
		for(var type in listen)
		{
			this._em.addListener(type, listen[type]);
		}
	},

	/**
	 */

	'write': function(chunk)
	{
		if(!this._sentWriting)
		{
			this._sentWriting = true;

			this._writing();
		}

		this._em.emit('write', chunk);
	},

	/**
	 */

	'end': function(chunk)
	{
		if(chunk) this.write(chunk);

		this._em.emit('end');
	},

	/**
	 */

	'_newRequest': function(ops)
	{
		return new PullRequest(ops);
	},

	/**
	 */

	'_writing': function(target)
	{
		if(!target) target = this;

		this._isWriting = true;

		if(!this.parent)
		{
			this._reader(target);
		}

		if(this.parent) this.parent._writing(target);
	}
});


module.exports = PullRequest;
