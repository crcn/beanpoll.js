Messenger = require "../concrete/messenger"

module.exports = class extends Messenger

	
	###
	###

	_next: (middleware) ->


		
		middleware.listener.call this, @message.query, @
		
		## streamed data? don't dump
		##if middleware.tags.stream
		##	middleware.listener.call this, @message, @
		##else
			
			##not streamed? load the data, then dump 
		##	@message.dump (err, result) => 
				
		##		try
		##			middleware.listener.call this, result, @
		##		catch e
		##			console.error e.stack
		##			@response.error e

	###
	 ack on end
	###

	_onEnd:() -> @response.end()
