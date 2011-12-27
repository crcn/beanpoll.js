AbstractDispatcher = require "../concrete/dispatcher"
Messanger = require "./messanger"
Response  = require "./response"

# 1 -> 1 request

module.exports = class extends AbstractDispatcher
	

	###
	###

	_newMessanger: (message, middleware) ->
		msgr = new Messanger message, middleware, @

		# dump the response data to the callback
		msgr.response.reader.dump message.callback, message.headers
		# message.callback msgr.response.reader

		msgr

	###
	###

	_prepareRequest: (route) ->
		listeners = super route

		if !!listeners.length then [listeners[0]] else []

	###
	###

	_prepareRoute: (route) ->
		filtered = @_findListeners route, false

		throw new Error "Route \"#{route.channel.value}\" already exists" if !!filtered.length

		route
		