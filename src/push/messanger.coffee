AbstractMessanger = require "../concrete/messanger"

module.exports = class extends AbstractMessanger

	###
	###

	_onNext: (middleware) ->
		@message.cache @_hasNext
		@message.dump middleware.listener, middleware.listener.route.tags

