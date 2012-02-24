Messenger = require "../concrete/messenger"

module.exports = class extends Messenger

	
	###
	###

	_next: (middleware) ->
	
		middleware.listener.call this, @request.query, @

	###
	 ack on end
	###

	_onEnd:() -> @response.end()
