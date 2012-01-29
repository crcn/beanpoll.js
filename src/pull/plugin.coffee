Director = require "./director"
outcome = require "outcome"

module.exports = (router) -> 
	
	director = new Director(router)

	name: "pull"


	###
	###

	director: director

	###
	###

	newListener: (listener) ->

		if !!listener.route.tags.pull
			router.pull(listener.route.channel, null, listener.tags, outcome success: listener.callback)
		

	###
	 extend the router
	###

	router: 
		pull: (channel, query, headers, callback) -> @_pull channel, query, headers, callback, 'pull'
		_pull: (channel, query, headers, callback, type) ->
		
			if typeof query == 'function'
				callback = query
				headers  = null
				query    = null
				
			if typeof headers == 'function'
				callback = headers
				headers  = null

			@request(channel, query, headers)[type] callback

	###
	 extend the message builder
	###

	message: 
		pull: (query, callback) -> @_pull query, callback, 'pull'
		_pull: (query, callback, type) ->
		
			if typeof query == 'function'
				callback = query
				query    = null

			@query(query) if !!query
			@response(callback) if !!callback


			@dispatch type
	
