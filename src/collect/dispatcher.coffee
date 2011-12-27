PullDispatcher = require "../pull/dispatcher"

# 1 -> many request

module.exports = class extends PullDispatcher
	

	###
	###

	_prepareRequest: (route) -> @_findListeners route

	###
	###

	_prepareRoute: (route) -> route
		