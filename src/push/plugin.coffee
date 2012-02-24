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
		
		router.request('new/listener').tag('private',true).query(listener).push();
		
	###
	###

	router: 

		push: (path, query, headers) -> @request(path, query, headers).push null

	###
	###
	
	request: 

		push: (data) ->
			
			# no error handler? add a blank func
			# if not @error() 
			#	@error ->

			writer = @dispatch director.name


			# if data exists, then we're done.
			writer.end data if !!arguments.length

			writer


