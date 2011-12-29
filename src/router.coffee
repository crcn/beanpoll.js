MessageWriter = require("./message").Writer
crema = require "crema"
PullDispatcher = require "./pull/dispatcher"
PushDispatcher = require "./push/dispatcher"
CollectDispatcher = require "./collect/dispatcher"

class Router
	
	###
	###
	
	constructor: () ->

		@_dispatchers = 
			pull: new PullDispatcher 
			push: new PushDispatcher 
			collect: new CollectDispatcher
		
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
			do (route) =>
				@_dispatchers[route.type].addRouteListener route, callback

				# bindings
				if route.tags.collect or route.tags.pull
					@request(route.channel)[if route.tags.collect then 'collect' else 'pull'] (err, response) ->
						callback(response)
					
		
		# finally return self
		@

	###
	 Initializes a new request
	###

	request: (channel, query, headers) ->

		# writer = MessageWriter.create().prepare 
		
		writer =  new MessageWriter (if typeof channel is "string" then crema.parseChannel(channel) else channel), @
		writer.options
			query: query
			headers: headers
		
		writer

	
	###
	 abreviated
	###

	req: () -> @request.apply this, arguments
		
	###
	 Pulls a request (1-to-1) - expects a return
	###
	

	pull: (channel, query, headers, callback) -> @_pull channel, query, headers, callback, "pull"
	

	###
	###

	collect: (channel, query, headers, callback) -> @_pull channel, query, headers, callback, "collect"

	###
	 Pushes a request (1-to-many) - NO return
	###
	
	push: (channel, data, query, headers) ->
		
		@request(channel, query, headers).push data


	###
	###

	_pull: (channel, query, headers, callback, type) ->
		
		if typeof query == 'function'
			callback = query
			headers  = null
			query    = null
			
		if typeof headers == 'function'
			callback = headers
			headers  = null

				
		@request(channel, query, headers)[type] callback

		
module.exports = Router;