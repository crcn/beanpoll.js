Messenger = require "../concrete/messenger"

module.exports = class extends Messenger

	###
	###

	start: () ->
		@response.req = @request
		super()

	###
	###

	_next: (middleware) ->

		middleware.listener.call this, @request, @response, @


	###
	###

	_onError: (error) ->

		@response.error error

	