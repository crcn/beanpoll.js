MessageWriter = require("./message").Writer
crema = require "crema"
PullDispatcher = require "./pull/dispatcher"
PushDispatcher = require "./push/dispatcher"

class Router
	
	###
	###
	
	constructor: () ->
		@_pushDispatcher = new PushDispatcher
		@_pullDispatcher = new PullDispatcher
		
	###
	 listens for a request
	###
	
	on: (routeOrListeners, callback) ->
		
		# easier setting up listeners if it's an object vs
		# calling .on each time
		if typeof routeOrListeners == "object"
			for type of routeOrListeners
				@.on type, routeOrListeners[type]
			return @
			
		for route in crema routeOrListeners
			
			# dispatcher is either push, or pull
			dispatcher = if route.type == "pull" then @._pullDispatcher else @._pushDispatcher

			dispatcher.addRouteListener route, callback
		
		# finally return self
		@
	
	###
	 Initializes a new request
	###

	request: (channel, query, headers) ->

		# writer = MessageWriter.create().prepare 
		
		writer =  new MessageWriter crema.parseChannel(channel), @
		writer.options
			query: query
			headers: headers
		
		writer
		
	###
	 Pulls a request (1-to-1) - expects a return
	###
	
	pull: (channel, query, headers, callback) ->
		
		if typeof query == 'function'
			callback = query
			headers  = null
			query    = null
			
		if typeof headers == 'function'
			callback = headers
			headers  = null

				
		@request(channel, query, headers).pull callback

	###
	 Pushes a request (1-to-many) - NO return
	###
	
	push: (channel, data, query, headers) ->
		
		@request(channel, query, headers).push data
		
module.exports = Router;