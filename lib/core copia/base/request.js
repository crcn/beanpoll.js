var Structr = require('structr'),
Parser = require('./parser'),
utils = require('./utils');

/**
 */

var Request = Structr({
	
	/**
	 */

	'__construct': function(ops)
	{

		//the path used (string) 
		this.path = ops.path;

		//the data passed to each listener
		this.data = ops.data || {};

		//metadata for the request. may contain important stuff like -stream, -batch
		this.meta = ops.meta || {};

		//where's the request coming from?
		this.from = ops.from;

		//need to go through these before firing the callback. optional
		this._thru = ops.thru;

		//the end callback which is fired after everything's done
		this._next = ops.next;

		//filtered listeners
		this._listeners = ops.listeners;

		//the target request (root)
		this.target = ops.target || this;

		//the pare the request
		this.parent = ops.parent;

		//some additional stuff might be needed.
		this.ops = ops;
	},

	/**
	 * next callback
	 */

	'next': function(data)
	{
		//these get hit first in order.
		if(this._thru.length)
		{
			var self = this;
			
			
			//note: default callback needs to be here otherwise funky shit happens (double callback, whoahh)
			return this._init(this._thru.shift());
		}


		//then the listeners get it at the same time
		if(this._listeners)
		{
			var listeners = this._listeners;
			this._listeners = null

			for(var i = listeners.length; i--;)
			{
				this._init(listeners[i]);	
			}

			return true;
		}

		//next should ONLY BE CALLED ONCE! It's actually a callback
		//which is past *by* the request while traversing through the listeners.
		//If next is called more than once, we could be hitting the same callback twice. Not good.
		if(this._next)
		{
			this._next.apply(this);
			this._next = null;
			return true;
		}


		//nothing else to parse? return false for any potential pass-thrus. It's useful if they
		//know if the chain was nexted or not.
		return false;
	},

	/**
	 * prepares the callback before firing
	 */

	'_init': function(ops, callback)
	{
		//params for the passthru? Fucking awesome. Apply them to the data object
		for(var param in ops.params)
		{
			//also, remember that ops.params are mapped to the index of the URI
			this.data[param] = this.path[ ops.params[param] ].name;
		}


		//this probably could be named a little better
		ops.dictionary = this.ops.dictionary || this._dictionary();

		//now the callback's ready, let's start calling shit. 
		this._passThru(ops, ops.thru.concat(), callback);
	},

	/**
	 * need to pass thru the callback before firing it off
	 */

	'_passThru': function(ops, allThru, callback)
	{
		//this happens if a pass thru is defined in the callback. like so:
		//router.on('authenticate/user -> get/user/mail'). Just recursively call the pass-thru methods
		//until there's no shit left to call.
		if(allThru.length)
		{
			var self = this;

			var thru = allThru.shift(),
				newOps = {
					target: this.target || this,
					dictionary: ops.dictionary,
					parent: this
				}

			//passthru? need to travel a level down, but always have reference back to the root so we know whos boss. (check out proxy.js) 
			return this.ops.router.dispatch(utils.replaceParams(Parser.parse(thru), this.data), this.data, newOps, function()
			{	
				//back to the passthru with the same ops. DATA might have changed ;)
				self._passThru(ops, allThru);
			});
		}

		//no more callbacks to pass thru, so callback the final listener. but Blah, we're calling another
		//method in Request >.>. It's because this shit needs to be overridden incase the callback function changes, duh. 
		this._callback.apply(this, [ops]);
	},

	/**
	 */


	'_dictionary': function()
	{
		return { }; //abstract
	},

	/**
	 * final callback
	 */

	'_callback': function(ops)
	{

		//blah blah blah, stfu. Design > speed (in some cases). Damn I LOVE cappuccino's.
		//Can't work without my fucking cappuccino, or machiato. Cappuccino > machiato IMO, but that all depends if whether you get the milk right.
		//Shit's not right if your milk's not velvety, and sweet. No sugar bitch. Lactose at a certain temp tastes sweet. Don't oversteam that shit, 
		//otherwise you're milk will cook. 140 F, and take the fucking steam wand out, and you're good to go. Sprinkle coco on that shit. 
		ops.callback.apply(this, [this.data, this]);
	}
	
});

module.exports = Request;