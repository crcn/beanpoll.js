Director = require "../pull/director"

# 1 -> many request

module.exports = class extends Director
	
	passive: true

	###
	###

	prepareListeners: (listeners) -> listeners
