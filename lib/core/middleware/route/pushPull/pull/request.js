var Bridge  = require('../bridge'),
	PushPullRequest = require('../request');


var PullRequest = PushPullRequest.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		this._super(ops);

		this._writer = this._next;

		//commented out for reference. this screws up any pass-thrus. 
		//UPDATE: Dunno why I did this without testing extensivly, but *not* commenting this really fucks shit up, considering when you call
		//a passthru directly, calling this.next() calls back the end call back, which we don't want.
		//fdsnkfanflsadkl comment this out for now
		// this._next = null;  
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
