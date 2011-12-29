AbstractMessanger = require "../concrete/messanger"
Response = require "./response"

module.exports = class extends AbstractMessanger

	###
	 constructor
	###
	
	constructor: (message, first, dispatcher) ->
		super message, first, dispatcher

		# response which is returned back to the caller
		@response = new Response @

	###
	###

	_next: (middleware) ->

		@message.cache @_hasNext
		middleware.listener.callback @, @response

	