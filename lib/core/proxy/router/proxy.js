var Bridge  = require('./bridge'),
	route   = require('./index'),
	Request = route.Request,
	Router  = route.Router,
	MultiRouter = route.MultiRouter,
	Parser  = route.Parser;

/**
 */

var ProxyRequest = Request.extend({

	/**
	 * Overrided parent _callback so we can handle it accordingly.
	 */
	
	'_callback': function(ops)
	{

		//write responses 
		var bridge = new Bridge(this),

			//the callback function
			listener = this._listener(ops),

			//who's handling it?
			responder = this._responder(ops),

			//what should be use to handle the request?
			meta = this._meta(ops),

			self = this;


		//because the framework needs to be easy to use, streams are turned off by default. This
		//would be a huge pain in the pass if every time they're required, but they're SUPER important
		//if we're trying to stream a large amount of data. What about HTTP? So if it's false, we need to 
		//add a stream handler.
		if(!meta.stream)
		{

			//the buffer for the streams
			var buffer = [];


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
						listener(buffer, self);
					}
					else
					{

						//so again, by default callback the listener as many times as there are batch values
						for(var i = 0, n = buffer.length; i < n; i++)
						{
							listener(buffer[i], self);
						}
					}
				}
			});
		}

		//is the listener expecting a stream? Okay, then pass on the writer to the listener. Only use this for files, http requests, and the
		//likes plz, omg you're code would look like shit otherwise >.>
		else
		{
			listener(bridge, self);
		}

		responder(bridge);
	},

	/**
	 * listens to a request
	 */

	'_listener': function(ops) { },

	/**
	 * responds to a request
	 */

	'_responder': function(ops) { },

	/**
	 * used to determine how the request is handled
	 */

	'_meta': function(ops) { },
});


var PullRequest = ProxyRequest.extend({
	
	/**
	 */

	'_listener': function(ops)
	{
		return this._next;
	},

	/**
	 */

	'_responder': function(ops)
	{
		return ops.callback;
	},

	/**
	 */

	'_meta': function(ops)
	{
		return this.meta;
	}
});

var PushRequest = ProxyRequest.extend({
	
	/**
	 */

	'_listener': function(ops)
	{
		return ops.callback;
	},

	/**
	 */

	'_responder': function(ops)
	{
		var responder = this._next;

		//no responder? the code looks like this: proxy.push('some.change','some.data');

		if(!responder)
		{
			responder = function(writer)
			{
				writer.end(writer.data);
			}
		}

		return responder;
	},

	/**
	 */

	'_meta': function(ops)
	{
		return ops.meta;
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
