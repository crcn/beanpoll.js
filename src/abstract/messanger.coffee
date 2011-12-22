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
	###
	
	_onNext: (middleware) ->
		middleware.listener @
	
		
		
