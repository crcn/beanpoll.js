Director = require "../concrete/Director"
Messenger = require "./messenger"

# 1 -> many event

module.exports = class extends Director
	
	passive: true

	###
	###

	_newMessenger: (message, middleware) -> new Messenger message, middleware, @