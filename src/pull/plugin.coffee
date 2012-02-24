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
			router.request(listener.route.path).headers(listener.route.tags).success(listener.callback).error(()->).pull();
		

	###
	 extend the router
	###

	router: 
		pull: (path, query, headers, callback) -> @_pull path, query, headers, callback, director.name
		_pull: (path, query, headers, callback, type) ->
		
			if typeof query == 'function'
				callback = query
				headers  = null
				query    = null
				
			if typeof headers == 'function'
				callback = headers
				headers  = null

			@request(path, query, headers)[type] callback

	###
	 extend the request builder
	###

	request: 
		pull: (query, callback) -> @_pull query, callback, director.name
		_pull: (query, callback, type) ->
		
			if typeof query == 'function'
				callback = query
				query    = null


			@query(query) if !!query
			@response(callback) if !!callback


			@dispatch type
	
