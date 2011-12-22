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

	request: (channelOrMessage, query, headers) ->
		
		
		writer = if channelOrMessage instanceof MessageWriter then channelOrMessage else new MessageWriter crema.parseChannel(channelOrMessage), @
		
		writer.options
			query: query
			headers: headers
		
		writer
		
	###
	 Pulls a request (1-to-1) - expects a return
	###
	
	pull: (channelOrMessage, query, headers, callback) ->
		
		if typeof query == 'function'
			callback = query
			headers  = null
			query    = null
			
		if typeof headers == 'function'
			callback = headers
			headers  = null

				
		@request(channelOrMessage, query, headers).pull callback

	###
	 Pushes a request (1-to-many) - NO return
	###
	
	push: (channelOrMessage, query, headers) ->
		
		@request(channelOrMessage, query, headers).push()
		
module.exports = Router;