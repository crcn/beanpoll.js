LinkedList = require "../../collections/linkedList"

module.exports = class Middleware extends LinkedList
	
	###
	 constructor 
	###
	
	constructor: (@channel, @listener) ->
	

Middleware.expand = (channel, listener, dispatcher) ->
	
	currentMiddleware = listener.getRoute().thru
	last = current    = new RequestMiddleware channel, listener
	
	while !!currentMiddleware
		
		middleware = dispatcher._collection.getRouteListener currentMiddleware.channel
		
		for mw in middleware
			current = Middleware::expand currentMiddleware.channel, mw, dispatcher
			last.addPrevSibling current.getLastSibling()
			last = current.getFirstSibling()
		
		currentMiddleware = currentMiddleware.thru
		
	last.getFirstSibling()
			
