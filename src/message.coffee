Reader = require "./reader"

module.exports = new class extends Reader
	
	###
	 constructor
	###
	
	constructor: (@channel, @router, @options) ->
		
		if _options 
			
			#header data which explains stuff about the route
			@headers = _options.headers
			
			#query data 
			@query = _options.query
			
			#source of the message
			@source = _options.source
			
			#destination of the message - callback
			@destination = _options.destination
			
		
		super()
			
	###
	 options which control how the request
	 is handled
	###

	options: (value) ->
		if !!arguments.length
			@_options = value || {}
			return @
		@_options
		
	###
	 pulls the given request (1-to-1)
	###
	
	pull: (data, callback) -> 
		@
		
	###
	 pushes a response out (1-to-many)
	###

	push: (data) ->
		@
		
		
	
		
module.exports::readable =		
module.exports::writable =
true
	


	