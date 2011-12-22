AbstractDispatcher = require "../abstract/dispatcher"
Messanger = require "./messanger"
Response  = require "./response"

module.exports = class extends AbstractDispatcher
	

	###
	###

	_newMessanger: (message, middleware) ->
		msgr = new Messanger message, middleware, @

		# dump the response data to the callback
		msgr.response.reader.dump message.callback, message.headers
		# message.callback msgr.response.reader

		msgr