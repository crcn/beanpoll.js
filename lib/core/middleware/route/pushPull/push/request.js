var Bridge  = require('../bridge'),
	PushPullRequest = require('../request');


var PushRequest = PushPullRequest.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		this._super(ops);


		//because pushed data can be delayed, we need to cache it until the receivers are ready. So, we need to pipe the
		//data once we hit the callback. 

		this._bridge = new Bridge(this, true);

		if(this.target != this && this.target._bridge)
		{
			this.target._bridge.pipe(this._bridge);
			// this._bridge.next = this.getMethod('next');
			return;
		}

		var responder = this._next;

		if(!responder)
		{
			responder = function(writer)
			{
				writer.end(writer.data);
			}
		}

		var response = responder.apply(this._bridge, [this._bridge]);

		if(response != undefined)
		{
			this._bridge.end(response);
		}

		// this._next = null;
	},

	/**
	 */

	'_callback': function(ops)
	{
		var bridge = new Bridge(this);


		this._listen(ops.callback, ops.meta, bridge);

		//piped the cached data. It may not even be cached :P
		this._bridge.pipe(bridge);
	}
});

module.exports = PushRequest;
