Director = require "../concrete/director"
Messenger = require "./messenger"

# 1 -> 1 request

module.exports = class extends Director
	

	###
	###

	_newMessenger: (message, middleware) -> new Messenger message, middleware, @

	###
	###

	addListener: (route, callback) ->
		@_validateListener route, callback
		super route, callback

	
	###
	###

	getListeners: (message) -> @prepareListeners super message


	###
	###

	prepareListeners: (listeners) -> if !!listeners.length then [listeners[0]] else []

	###
	###

	_validateListener: (route) ->

		listeners = @_collection.get route.channel, route.tags

		throw new Error "Route \"#{route.channel.value}\" already exists" if !!listeners.length
		