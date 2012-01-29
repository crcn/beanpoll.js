Director = require "./director"
outcome = require "outcome"

module.exports = (router) -> 
	
	director = new Director("pull", router)

	name: director.name


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
		pull: (channel, query, headers, callback) -> @_pull channel, query, headers, callback, director.name
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
		pull: (query, callback) -> @_pull query, callback, director.name
		_pull: (query, callback, type) ->
		
			if typeof query == 'function'
				callback = query
				query    = null

			@query(query) if !!query
			@response(callback) if !!callback


			@dispatch type
	
