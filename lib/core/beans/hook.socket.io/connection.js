var Structr = require('structr');

module.exports = Structr({
	
	/**
	 */

	'__construct': function(socket)
	{
		this._socket = socket;
		this._id  = socket.id;

		var self = this;

		socket.on('message', function(batch)
		{
			batch.forEach(function(msg)
			{
				self.onMessage(msg);
			})
		});

		socket.on('disconnect', function()
		{
			console.log('socket disconnect :%d', self._id);
			self.onExit();
		});
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
		this._socket.json.send(this._batch);
		this._batch = null;
	},

	'onExit': function()
	{
		
	},

	'onMessage': function()
	{
		
	}
});