Messenger = require "../concrete/messenger"

module.exports = class extends Messenger

	###
	###

	start: () ->
		super()

	###
	###

	_next: (middleware) ->

		## if this is middleware, then data coming from the MESSAGE should be cached incase
		## we're dealing with an async request 
		@message.cache @hasNext

		middleware.listener.call this, @message, @response, @


	###
	###

	_onError: (error) ->

		@response.error error

	