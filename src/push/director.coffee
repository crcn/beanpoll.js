Director = require "../concrete/director"
Messenger = require "./messenger"

# 1 -> many event

module.exports = class extends Director
	
	passive: true

	###
	###

	_newMessenger: (request, middleware) -> new Messenger request, middleware, @