var Structr = require('structr'),
Parser = require('./parser');


var Request = Structr({
	
	/**
	 */

	'__construct': function(listener, batch)
	{
		// this.batch  = batch;
		this.data     = batch.data;
		this.router   = batch.router.controller;
		this.callback = batch.callback;

		this._used = {};
		this._queue = [];

		this._add(listener, this.data);


		if(batch._next)
		{
			this.add(batch._next);
		}

	},

	/**
	 */

	'init': function()
	{
		return this;
	},

	/**
	 */

	'hasNext': function()
	{
		return !!this._queue.length;
	},

	/**
	 */

	'next': function()
	{
		if(this._queue.length)
		{
			var thru = this._queue.pop(),
			target = thru.target;

			this.current = target;

			if(target.paths)
			{
				var route = this.router.getRoute({ channel: target });

				this._addListeners(route.listeners, route.data);
				return this.next();
			}

			if(this._used[target.id]) return this.next();

			//keep tabs of what's used so there's no overlap. this will happen when we get back to the router
			//for middleware specified in path -> to -> route
			this._used[target.id] = thru;
			
			this._prepare(target, thru.data);
			

			return true;
		}

		return false;
	},

	/**
	 */
	
	'_addListeners': function(listeners, data)
	{
		if(listeners instanceof Array)
		{
			for(var i = listeners.length; i--;)
			{
				this._add(listeners[i], data);
			}
			return;
		}
	},

	/**
	 * adds middleware to the END of the call stack
	 */
	
	'add': function(callback)
	{
		this._queue.unshift(this._func(callback));
	},

	/**
	 * adds  middleware to the beginning of the call stack
	 */
	
	'unshift': function(callback)
	{
		this._queue.push(this._func(callback));
	},

	/**
	 */

	'_func': function(callback)
	{
		return { target: { callback: callback }, data: {} };
	},

	/**
	 */

	'_add': function(route, data)
	{
		var current = route, _queue = this._queue;

		while(current)
		{
			//make sure not to use the same route twice. this will happen especially with middleware specified as /middleware/*
			_queue.push({ target: current, data: data });

			current = current.thru;
		}
	},

	/**
	 */

	'_prepare': function(target, data)
	{
		for(var index in data._params)
		{
			//breaks on middleware
            var v = target.path[index];
            if(!v) break;

			var iname = target.path[index].name;

			//should it really be set to global?
			this.data[iname] = data[iname] = data._params[index];
		}

		this._callback(target, data);
	},

	/**
	 */

	'_callback': function(target, data)
	{
		return target.callback.call(this, this);
	}
});

module.exports = Request;