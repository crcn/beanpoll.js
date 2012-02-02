Director = require "../concrete/director"
Messenger = require "./messenger"

# 1 -> 1 request

module.exports = class extends Director
	
	passive: false

	###
	###

	_newMessenger: (message, middleware) -> new Messenger message, middleware, @

	
	###
	###

	getListeners: (message) -> @prepareListeners super message


	###
	###

	prepareListeners: (listeners) -> if !!listeners.length then [listeners[0]] else []

		