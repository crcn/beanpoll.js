Messenger = require "../concrete/messenger"

module.exports = class extends Messenger

	###
	###

	start: () ->
		@response.req = @message
		super()

	###
	###

	_next: (middleware) ->

		middleware.listener.call this, @message, @response, @


	###
	###

	_onError: (error) ->

		@response.error error

	