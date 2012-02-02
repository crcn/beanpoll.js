Director = require "./director"
outcome = require "outcome"



module.exports = (router) ->
	
	director = new Director("collect", router)

	name: director.name

	director: director

	router: 
		collect: (channel, query, headers, callback) -> @_pull channel, query, headers, callback, director.name

	newListener: (listener) ->


		if !!listener.route.tags.collect
			router.request(listener.route.channel).headers(listener.route.tags).success(listener.callback).collect();
		
	
	message: 
		collect: (query, callback) -> @_pull query, callback, director.name