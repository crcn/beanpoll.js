AbstractMessanger = require "../concrete/messanger"

module.exports = class extends AbstractMessanger

	###
	###

	_next: (middleware) ->
		@message.cache @_hasNext
		@message.dump (err, result) ->
			middleware.listener.callback(result)
		, middleware.listener.route.tags

