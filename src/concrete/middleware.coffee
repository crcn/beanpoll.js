LinkedList = require "../collections/linkedList"

module.exports = class Middleware extends LinkedList
	
	###
	 constructor 
	###
	
	constructor: (item, @director) ->

		@listener = item.value
		@channel  = paths: item.cmpPath
		@params   = item.params
		@tags 	  = item.tags
		@path     = item.path # path string

	

###
 Wraps the chained callbacks in middleware 
###

Middleware.wrap = (chain, pre, next, director) ->

	for item in chain
		current = new Middleware item, director
		current.addPrevSibling prev, true if prev
		prev = current

	if typeof pre == 'function'
		current.getFirstSibling().addPrevSibling new Middleware value: pre, params: {}, tags: {}, channel: paths: []

	if typeof next == 'function'
		current.addNextSibling new Middleware value: next, params: {}, tags: {}, channel: paths: []

		
	current.getFirstSibling()
			
