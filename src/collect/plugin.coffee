Director = require "./director"
outcome = require "outcome"



module.exports = (router) ->
	
	director = new Director("collect", router)

	name: director.name

	director: director

	router: 
		collect: (path, query, headers, callback) -> @_pull path, query, headers, callback, director.name

	newListener: (listener) ->


		if !!listener.route.tags.collect
			router.request(listener.route.path).headers(listener.route.tags).success(listener.callback).collect();
		
	
	request: 
		collect: (query, callback) -> @_pull query, callback, director.name