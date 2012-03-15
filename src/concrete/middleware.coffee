LinkedList = require "../collections/linkedList"

module.exports = class Middleware extends LinkedList
	
	###
	 constructor 
	###
	
	constructor: (item, @director) ->

		@listener = item.value
		@path     = segments: item.cmpSegments
		@params   = item.params
		@tags 	  = item.tags

	

###
 Wraps the chained callbacks in middleware 
###

Middleware.wrap = (chain, pre, next, director) ->

	for item in chain
		current = new Middleware item, director
		current.addPrevSibling prev, true if prev
		prev = current

	if typeof pre == 'function'
		current.getFirstSibling().addPrevSibling new Middleware value: pre, params: {}, tags: {}, path: segments: []

	if typeof next == 'function'
		current.addNextSibling new Middleware value: next, params: {}, tags: {}, path: segments: []

		
	current.getFirstSibling()
			
