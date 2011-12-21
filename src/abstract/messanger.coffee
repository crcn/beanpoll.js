LinkedQueue = require "../../collections/linkedQueue"

module.exports = class extends LinkedQueue
	
	###
	 constructor
	###
	
	constructor: (@message, @first, @dispatcher) ->
		super first
		@router = dispatcher.router 
	
	###
	###
	
	_onNext: (listener) ->
		listener @
	
		
		
