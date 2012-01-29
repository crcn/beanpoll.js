Messenger = require "../concrete/messenger"
Response = require "./response"

module.exports = class extends Messenger

	###
	###

	start: () ->
		@response = new Response @
		@response.reader().dump (() => @message.callback.apply @message, arguments), @message.headers
		super()

	###
	###

	_next: (middleware) ->

		## if this is middleware, then data coming from the MESSAGE should be cached incase
		## we're dealing with an async request 
		@message.cache @hasNext

		middleware.listener @message, @response, @


	###
	###

	_onError: (error) ->

		@response.error error

	