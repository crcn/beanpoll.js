Messenger = require "../concrete/messenger"

module.exports = class extends Messenger

	
	###
	###

	start: () ->

		# immediate ack
		@response.end()


		super()

	###
	###

	_next: (middleware) ->

		## if we're not at the end, then cache incomming data.
		@message.cache @hasNext


		## streamed data? don't dump
		if middleware.tags.stream
			middleware.listener.callback @message, @
		else
			
			##not streamed? load the data, then dump 
			@message.dump (err, result) -> middleware.listener result, @
		

