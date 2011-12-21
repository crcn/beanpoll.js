AbstractMessanger = require "../abstract/messanger"

module.exports = class extends AbstractMessanger

	###
	###

	_onNext: (listener) ->
		@messanger.cache @_hasNext
		@messanger.dump listener, listener.route.tags