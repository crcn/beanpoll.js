AbstractMessanger = require "../abstract/messanger"

module.exports = class extends AbstractMessanger

	###
	###

	_onNext: (middleware) ->
		@messanger.cache @_hasNext
		@messanger.dump middleware.listener, listener.route.tags

