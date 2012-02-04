dolce   = require "dolce"
RequestMiddleware = require "./middleware"
crema = require "crema"
Messenger = require "./messenger"


###

Director process:

###


module.exports = class
	
	###
	 some directors are passive, meaning errors aren't returned if a route does not exist. This goes for collectors,
	 emitters, etc.
	###

	passive: false
	
	###
	 constructor
	###
	
	constructor: (@name, @router) ->
		@_collection = dolce.collection()

	###
	 returns number of listeners based on channel given
	###

	numListeners: (channel, ops) -> @_collection.get(channel, ops).chains.length
	
	###
	 dispatches a request
	###
	
	dispatch: (messageWriter) ->
		
		# find the listeners based on the channel given
		chains = @getListeners messageWriter

		numChains  = chains.length
		numRunning = numChains
		oldAck     = messageWriter.callback

		messageWriter.running = !!numChains


		# replace the with an ack so we can return exactly HOW many listeners there are...
		messageWriter.callback = () ->
			messageWriter.running = !!(--numRunning)
			oldAck.apply this, Array.apply(null, arguments).concat([numRunning, numChains]) if oldAck


		if not !!chains.length and not @passive
			messageWriter.callback new Error "#{@name} route \"#{crema.stringifyPaths(messageWriter.channel.paths)}\" does not exist" 
			return @

			
		# in pull bases, there will only be one listener. For push, there maybe multiple
		for chain in chains


			# there needs to be a NEW reader for each listener.
			messageReader = messageWriter.reader()

			# wrap the middleware  
			middleware   = RequestMiddleware.wrap chain, messageWriter.pre, messageWriter.next, @

			# pass through the factory class which creates a new request, OR uses a recycled request 
			messanger	     = @_newMessenger messageReader, middleware

			# send the request
			messanger.start()
		@
		
	###
	 adds a route listener to the collection tree
	###
	
	addListener: (route, callback) ->

		disposable

		## one tag present? remove listener on end
		if route.tags.one
			oldCallback = callback
			callback    = () ->
				oldCallback.apply this, arguments
				disposable.dispose()

		# validate the route incase we're dealing with a director where only ONE listener can be on each 
		# channel
		@_validateListener route, callback

		# set the disposable incase we're dealing with a route that listens ONCE for a request
		disposable = @_collection.add route, callback


	###
	###

	channels: (ops) ->
		
		channels = []

		for listener in @_collection.find ops
			(tags: listener.tags,
			type: @name,
			path: listener.path)


	###
	###

	listenerQuery: (ops) ->

		
		## FIXME - unfilterable should be specified in messenger
		$or: [ { $and: ops.filter || [] }, { unfilterable: $exists: true } ]

	###
	###
	
	getListeners: (message) -> 
		@_collection.get(message.channel, siftTags: @listenerQuery(message) ).chains
		
	###
	###

	routeExists: (route) -> @_collection.contains(route.channel, siftTags: @listenerQuery(route) )


	###
	 returns a new request
	###
	
	_newMessenger: (message, middleware) -> new Messenger message, middleware, @
	

	###
	###

	_validateListener: (route) ->

		return if @passive

		listeners = @_collection.get route.channel, route.tags

		throw new Error "Route \"#{route.channel.value}\" already exists" if !!listeners.length
		







