LinkedQueue = require "../collections/linkedQueue"

module.exports = class extends LinkedQueue
	
	###
	 constructor
	###
	
	constructor: (@message, @first, @dispatcher) ->
		super first
		@router   = dispatcher.router 
		@headers  = message.headers
		@query    = message.query
		# @params   = {}
	
	###
	 proxy to message
	###

	on: (type, fn) -> @message.on type, fn

	###
	###

	dump: (callback) -> @message.dump callback

	###
	###

	start:() -> @next()

	###
	### 
	_onNext: (middleware) ->

		for path, i in middleware.listener.route.channel.paths

			@query[path.value] = middleware.channel.paths[i].value if path.param
			
		

		@_next middleware

	###
	###
	
	_next: (middleware) ->
		middleware.listener.callback @
	
		
		
