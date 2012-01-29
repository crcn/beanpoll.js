Director = require "../pull/director"

# 1 -> many request

module.exports = class extends Director
	

	###
	###

	prepareListeners: (listeners) -> listeners

	##
	##

	_validateListener: () -> # do nothing.
		