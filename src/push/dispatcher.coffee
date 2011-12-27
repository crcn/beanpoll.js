AbstractDispatcher = require "../concrete/dispatcher"
Messanger = require "./messanger"

# 1 -> many event

module.exports = class extends AbstractDispatcher
	

	###
	###

	_newMessanger: (message, middleware) ->
		new Messanger message, middleware, @