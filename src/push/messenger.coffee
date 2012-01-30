Messenger = require "../concrete/messenger"

module.exports = class extends Messenger

	
	###
	###

	_next: (middleware) ->

		## if we're not at the end, then cache incomming data.
		@message.cache @hasNext


		## streamed data? don't dump
		if middleware.tags.stream
			middleware.listener.call this, @message, @
		else
			
			##not streamed? load the data, then dump 
			@message.dump (err, result) => middleware.listener.call this, result, @
		

	###
	 ack on end
	###

	_onEnd:() -> @response.end()
