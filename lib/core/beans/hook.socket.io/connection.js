var Structr = require('structr');

module.exports = Structr({
	
	/**
	 */

	'__construct': function(socket)
	{
		this._socket = socket;
		this._id  = socket.id;

		var self = this;

		socket.on('messages', function(messages)
		{
			messages.forEach(function(msg)
			{
				self.onMessage(msg);
			})
		})

		socket.on('message', this.getMethod('onMessage'));
		socket.on('disconnect', this.getMethod('onExit'));
	},

	/**
	 */

	'send': function(message, callback)
	{
		if(!this._batch)
		{
			this._batch = [];
			setTimeout(this.getMethod('_sendBatch'), 1);
		}

		this._batch.push(message);
	},

	/**
	 */

	'_sendBatch': function()
	{
		this._socket.emit('messages', this._batch);
		this._batch = null;
	},

	'onExit': function()
	{
		
	},

	'onMessage': function()
	{
		
	}
});