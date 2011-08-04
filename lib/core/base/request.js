var Structr = require('structr'),
Parser = require('./parser');



var BatchRequest = Structr({

	/**
	 */

	'init': function()
	{
		return this;
	},

	/**
	 */

	'next': function()
	{
		for(var i = this.listeners.length; i--;)
		{
			new ListenerRequest(this.listeners[i], this).next();
		}
	}
});


var ListenerRequest = Structr({
	
	/**
	 */

	'__construct': function(listener, batch)
	{
		// this.batch  = batch;
		this.data   = batch.data;
		this.router = batch.router;

		this._used = {};

		this._enqueue(listener, this.data);
	},

	/**
	 */

	'next': function()
	{
		if(this._queue.length)
		{
			var thru = this._queue.pop(),
			target = thru.target;

			//keep tabs of what's used so there's no overlap. this will happen when we get back to the router
			//for middleware specified in path -> to -> route
			this._used[thru.target.id] = thru;


			if(target.paths)
			{
				var route = this.router.getRoute({ channel: target });

				this._enqueueListeners(route.listeners, route.data);
				return this.next();
			}
			else
			{
				this._callback(target, thru.data);
			}

			return true;
		}

		return false;
	},

	/**
	 */
	
	'_enqueueListeners': function(listeners, data)
	{
		if(listeners instanceof Array)
		{
			for(var i = listeners.length; i--;)
			{
				this._enqueue(listeners[i], data);
			}
			return;
		}
	},

	/**
	 */

	'_enqueue': function(route, data)
	{
		if(!this._queue) this._queue = [];

		var current = route, _queue = this._queue;

		while(current)
		{
			//make sure not to use the same route twice. this will happen especially with middleware specified as /middleware/*
			if(!this._used[current.id]) _queue.push({ target: current, data: data });

			current = current.thru;
		}
	},

	/**
	 */

	'_callback': function(target, data)
	{
		for(var index in data._params)
		{
			var iname = target.path[index].name;

			//should it really be set to global?
			this.data[iname] = data[iname] = data._params[index];
		}

		target.callback.apply(this, [this.data, this]);
	}


})



module.exports = BatchRequest;