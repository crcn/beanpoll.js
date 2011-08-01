var Bridge  = require('../bridge'),
	PushPullRequest = require('../request');


var PullRequest = PushPullRequest.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		this._super(ops);

		this._writer = this._next;

		//it's the root if target == this, and we need next to get back to the pull requestor, otherwise it's a pass thru. IF it's a pass-thru, 
		//and next *is* null, then we'll never get to the end callback. IF it's *not* null, and the pass thru is called directly, next will return the final callback, (requestor),
		//and an error will be thrown.
		if(this.target == this) this._next = null;  
	},

	/**
	 */

	'_callback': function(ops)
	{
		var bridge = new Bridge(this);

		//here's where it gets a little interesting. We need to tie up the ORIGINAL writer, with the current bridge since anything returned
		//to the pass-thru is sent back to the client. By default, doing so usually means an error ocurred (stop in the process). 
		this._listen(this.target._writer, this.target.meta, bridge);

		var response = ops.callback.apply(bridge, [bridge]);

		//if there is a response, then we can use that to send data.
		if(response != undefined)
		{
			bridge.end(response);
		}
	}
});

module.exports = PullRequest;
