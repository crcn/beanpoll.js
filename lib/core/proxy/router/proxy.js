var Bridge  = require('./bridge'),
	route   = require('./index'),
	Request = route.Request,
	Router  = route.Router,
	Parser  = route.Parser;

/**
 */

var ProxyRequest = Request.extend({

	/**
	 */

	'_listen': function(listener, meta, bridge)
	{
		//because the framework needs to be easy to use, streams are turned off by default. This
		//would be a huge pain in the pass if every time they're required, but they're SUPER important
		//if we're trying to stream a large amount of data. What about HTTP? So if it's false, we need to 
		//add a stream handler.
		if(!meta.stream)
		{
			//the buffer for the streams
			var buffer = [], self = this;

			bridge.on({

				//on write, throw the data into the buffer
				write: function(data)
				{
					buffer.push(data);
				},

				//on end, callback the listener
				end: function()
				{
					//again, it would be a pain in the ass if everytimg we have to do: var value = response[0]. So
					//a "batch" must be specified if we're expecting an array, because 99% of the time for in-app route handling, 
					//only ONE value will be returned. 
					if(meta.batch)
					{
						listener.apply(self, [buffer, self]);
					}
					else
					{
						if(!buffer.length)
						{
							listener();
						}
						else
						//so again, by default callback the listener as many times as there are batch values
						for(var i = 0, n = buffer.length; i < n; i++)
						{
							listener.apply(self, [buffer[i], self]);
						}
					}
				}
			});
		}

		//is the listener expecting a stream? Okay, then pass on the writer to the listener. Only use this for files, http requests, and the
		//likes plz, omg you're code would look like shit otherwise >.>
		else
		{
			//more flavor picking. Use this, or the passed obj
			listener.apply(bridge, [bridge, this]);
		}
	}
});


var PullRequest = ProxyRequest.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		this._super(ops);

		this._writer = this._next;


		//commented out for reference. this screws up any pass-thrus. 
		//UPDATE: Dunno why I did this without testing extensivly, but *not* commenting this really fucks shit up, considering when you call
		//a passthru directly, calling this.next() calls back the end call back, which we don't want.
		this._next = null;  
	},

	/**
	 */

	'_callback': function(ops)
	{
		
		var bridge = new Bridge(this);

		this._listen(this._writer, this.meta, bridge);

		ops.callback.apply(bridge, [bridge]);
	}
});

var PushRequest = ProxyRequest.extend({
	
	/**
	 */

	'override __construct': function(ops)
	{
		this._super(ops)


		//because pushed data can be delayed, we need to cache it until the receivers are ready. So, we need to pipe the
		//data once we hit the callback. 
		this._bridge = new Bridge(this, true);

		var responder = this._next;

		if(!responder)
		{
			responder = function(writer)
			{
				writer.end(writer.data);
			}
		}

		responder.apply(this._bridge, [this._bridge]);

		this._next = null;
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

var ProxyRouter = Router.extend({
	
	/**
	 */

	'_from': function()
	{
		return this._ops.proxy;
	}
})
/**
 */

var PullRouter = ProxyRouter.extend({
	
	/**
	 */

	'_getRequest': function(ops)
	{
		return new PullRequest(ops);
	}
});


var PushRouter = ProxyRouter.extend({
	
	/**
	 */

	'_getRequest': function(ops)
	{
		return new PushRequest(ops);
	}
});



exports.Parser	  	    = Parser;
exports.PushRouter      = PushRouter;
exports.PullRouter      = PullRouter;
