LinkedQueue = require "../collections/linkedQueue"

module.exports = class extends LinkedQueue
	
	###
	 constructor
	###
	
	constructor: (@message, @first, @dispatcher) ->
		super first
		@router = dispatcher.router 
		@headers  = message.headers
		@query    = message.query
	
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
		middleware.listener.callback @
	
		
		
