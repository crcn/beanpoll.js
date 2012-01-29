LinkedList = require "../collections/linkedList"

module.exports = class Middleware extends LinkedList
	
	###
	 constructor 
	###
	
	constructor: (item, @director) ->
		@listener = item.value
		@channel  = paths: item.paths
		@params   = item.params
		@tags 	  = item.tags
	

###
 Wraps the chained callbacks in middleware 
###

Middleware.wrap = (chain, director) ->

	for item in chain
		current = new Middleware item, director
		current.addPrevSibling prev, true if prev
		prev = current


		
	current.getFirstSibling()
			
