Director = require "./director"

module.exports = (router) -> 
	
	director = new Director(router)

	name: "push"

	director: director
		
	router: 

		push: (channel, data, query, headers) -> @request(channel, query, headers).push data

	message: 

		push: (data) ->

			writer = @dispatch "push"

			

			# if data exists, then we're done.
			writer.end data if !!arguments.length

			writer


