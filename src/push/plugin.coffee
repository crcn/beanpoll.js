Director = require "./director"

module.exports = (router) -> 
	
	###
	###
	
	director = new Director("push", router)

	###
	###
	
	name: director.name

	###
	###
	
	director: director

	###
	###

	newListener: (listener) ->
		
		router.request('new/listener').query(listener).push();
		
	###
	###

	router: 

		push: (channel, query, headers) -> @request(channel, query, headers).push null

	###
	###
	
	message: 

		push: (data) ->
			
			# no error handler? add a blank func
			# if not @error() 
			#	@error ->

			writer = @dispatch director.name


			# if data exists, then we're done.
			writer.end data if !!arguments.length

			writer


