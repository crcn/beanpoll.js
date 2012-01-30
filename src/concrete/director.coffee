dolce   = require "dolce"
RequestMiddleware = require "./middleware"
crema = require "crema"
Messenger = require "./messenger"


###

Director process:

###


module.exports = class
	
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

		numChains = chains.length
		numRunning = numChains
		oldAck = messageWriter.callback

		messageWriter.running = !!numChains


		# replace the with an ack so we can return exactly HOW many listeners there are...
		messageWriter.callback = () ->
			messageWriter.running = !!(--numRunning)
			oldAck.apply this, Array.prototype.concat.apply([], arguments, [numRunning, numChains]) if oldAck
			
		# in pull bases, there will only be one listener. For push, there maybe multiple
		for chain in chains


			# there needs to be a NEW reader for each listener.
			messageReader = messageWriter.reader()

			# wrap the middleware  
			middleware   = RequestMiddleware.wrap chain, messageWriter.next, @

			# pass through the factory class which creates a new request, OR uses a recycled request 
			messanger	     = @_newMessenger messageReader, middleware

			# send the request
			messanger.start()
		@
		
	###
	 adds a route listener to the collection tree
	###
	
	addListener: (route, callback) ->
		@_collection.add route, callback


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

		tags = []
		tag = {}

		for tagName of ops.tags
			ops.tags[tagName] = $exists: true if ops.tags[tagName] is true
			tag = {}
			tag[tagName] = ops.tags[tagName]
			tags.push(tag)


		search = $or: [ { $and: tags }, { unfilterable: $exists: true } ]

	###
	###
	
	getListeners: (route) -> @_collection.get(route.channel, siftTags: @listenerQuery(route) ).chains
		
	###
	###

	routeExists: (route) -> @_collection.contains(route.channel, siftTags: @listenerQuery(route) )


	###
	 returns a new request
	###
	
	_newMessenger: (message, middleware) -> new Messenger message, middleware, @
		







