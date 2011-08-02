var Structr = require('structr'),
EventEmitter = require('sk/core/events').EventEmitter;

/**
 the bridge between the listener, and responder. Yeah, Yeah. the listener
 has the ability to write data. Total breaks encapsulation. but meh, it's fucking javascript :/.
 */

var Bridge = Structr({
	
	/**
	 * @param the current request
	 * @param ttl time to keep cached version in memory before dumping it
	 */

	'__construct': function(request, ops, ttl)
	{
		this._em = new EventEmitter();	


		//blah, this could be done a lot better, but I'm a lazy coder. Until
		//I'm past designing the code, and onto optimization, this will be here :P
		if(request)
		{
			// Structr.copy(ops, this, true);
			Structr.copy(request, this, true);
		}

		if(!ops.dictionary) ops.dictionary = {};
		if(!ops.dictionary.response) ops.dictionary.response = {};
		if(!ops.dictionary.internal) ops.dictionary.internal = {};

		this._callbacks = [];
		this._response = ops.dictionary.response;
		this.internal = ops.dictionary.internal;
		this._responseSent = false;

		//TODO: set ttl maybe. Might be just GC'd
		if(ttl)
		{

			//store the buffer incase data comes a little quicker than we can handle it.
			var buffer = this._buffer = [], self = this;

			this.on({
				write: function(chunk)
				{
					buffer.push(chunk)
				}
			});
		}
	},

	/**
	 */

	'on': function(listeners)
	{
		for(var type in listeners)
		{
			this._em.addListener(type, listeners[type]);
		}
	},

	/**
	 */

	'response': function(data)
	{
		Structr.copy(data, this._response, true);
	},

	/**
	 */

	'error': function(data)
	{
		this._em.emit('error', data);
	},

	/**
	 */

	'write': function(data)
	{
		if(!this._responseSent)
		{
			this._responseSent = true;
			
			//okay, this looks stupid, but there's a reason why I'm stringifying, and parsing the response. It tells anything in the response, which 
			//might be converted to JSON that we're done writing. It's like a cheap way of calling the observer method. Also, this will get stringified
			//anyways when passed over a network ;)
			this._em.emit('response', JSON.parse(JSON.stringify(this._response)));	
		}

		this._em.emit('write', data);
	},

	/**
	 */

	'end': function(data)
	{
		if(data) this.write(data);

		this.finished = true;

		this._em.emit('end', data);

		this._em.dispose();
	},

	/**
	 */

	'pipe': function(bridge)
	{

		//IF there is a buffer, that means it came faster than we can handle it. This sort of thing
		//occurrs when there are pass-thru routes which hold up the final callback. e.g: authenticating a user against
		//a database
		if(this._buffer && this._buffer.length)
		{
			for(var i = 0, n = this._buffer.length; i < n; i++)
			{
				bridge.write(this._buffer[i]);
			}	
		}

		//already finished? return
		if(this.finished)
		{
			return bridge.end();
		}

		//looks like the bridge is still handling data, so listen for the rest
		this.on({
			write: function(data)
			{
				bridge.write(data);
			},
			end: function()
			{
				bridge.end();
			},
			error: function(e)
			{
				if(bridge.error) bridge.error(e);
			},
			response: function(data)
			{
				if(bridge.response) bridge.response(data);
			}
		});
	}
});


module.exports = Bridge;