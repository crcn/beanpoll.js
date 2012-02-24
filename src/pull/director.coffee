Director = require "../concrete/director"
Messenger = require "./messenger"

# 1 -> 1 request

module.exports = class extends Director
	
	passive: false

	###
	###

	_newMessenger: (request, middleware) -> new Messenger request, middleware, @

	
	###
	###

	getListeners: (request, search) -> @prepareListeners super request, search


	###
	###

	prepareListeners: (listeners) -> if !!listeners.length then [listeners[0]] else []

		