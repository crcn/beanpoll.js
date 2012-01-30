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
			router.collect(listener.route.channel, null, listener.tags, outcome success: listener.callback)
		
	
	message: 
		collect: (query, callback) -> @_pull query, callback, director.name