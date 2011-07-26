var Structr = require('structr'),
EventEmitter = require('sk/core/events').EventEmitter;

/**
 the bridge between the listener, and responder. Yeah, Yeah. the listener
 has the ability to write data. Total breaks encapsulation. but meh, it's fucking javascript :/.
 */

var Bridge = Structr({
	
	/**
	 */

	'__construct': function(request)
	{
		this._em = new EventEmitter();	


		//blah, this could be done a lot better, but I'm a lazy coder. Until
		//I'm past designing the code, and onto optimization, this will be here :P
		if(request)
		{
			for(var prop in request)
			{
				this[prop] = request[prop];
			}
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
		this._em.emit('response', data);
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
		this._em.emit('write', data);
	},

	/**
	 */

	'end': function(data)
	{
		if(data) this.write(data);

		this._em.emit('end', data);

		this._em.dispose();
	},

	/**
	 */

	'pipe': function(bridge)
	{
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