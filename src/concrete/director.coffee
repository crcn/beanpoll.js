dolce   = require "dolce"
RequestMiddleware = require "./middleware"
crema = require "crema"
Messenger = require "./messenger"
comerr = require "comerr"


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
	 returns number of listeners based on path given
	###

	numListeners: (path, ops) -> @_collection.get(path, ops).chains.length
	
	###
	 dispatches a request
	###
	
	dispatch: (requestWriter) ->

		try 
			# find the listeners based on the path given
			chains = @getListeners requestWriter, undefined, !@passive
		catch e
			return requestWriter.callback new Error "#{@name} #{e.message}"


		numChains  = chains.length
		numRunning = numChains
		oldAck     = requestWriter.callback

		requestWriter.running = !!numChains


		# replace the with an ack so we can return exactly HOW many listeners there are...
		requestWriter.callback = () ->
			requestWriter.running = !!(--numRunning)
			oldAck.apply this, Array.apply(null, arguments).concat([numRunning, numChains]) if oldAck


		if not !!chains.length and not @passive
			requestWriter.callback new comerr.NotFound "#{@name} route \"#{crema.stringifySegments(requestWriter.path.segments)}\" does not exist" 
			return @

			
		# in pull bases, there will only be one listener. For push, there maybe multiple
		for chain in chains


			# there needs to be a NEW reader for each listener.
			requestReader = requestWriter.reader()

			# wrap the middleware  
			middleware   = RequestMiddleware.wrap chain, requestWriter.pre, requestWriter.next, @

			# pass through the factory class which creates a new request, OR uses a recycled request 
			messanger	     = @_newMessenger requestReader, middleware

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
		# path
		@_validateListener route, callback

		# set the disposable incase we're dealing with a route that listens ONCE for a request
		disposable = @_collection.add route, callback

	###
	###

	removeListeners: (route) ->
		@_collection.remove route.path, tags: route.tags

	###
	###

	paths: (ops) ->
		
		for listener in @_collection.find ops
			(tags: listener.tags,
			type: @name,
			value: listener.path,
			segments: listener.segments)

	###
	###

	listenerQuery: (ops) ->

		filter = []

		# to array
		for key of ops.filter 
			tag = {}
			tag[key] = ops.filter[key]
			filter.push tag
		
		## FIXME - unfilterable should be specified in messenger
		$or: [ { $and: filter }, { unfilterable: $exists: true } ]

	###
	###
	
	getListeners: (request, expand, throwError) -> 
		@_collection.get(request.path, siftTags: @listenerQuery(request), expand: expand, throwErrors: throwError ).chains
		

	###
	 returns a new request
	###
	
	_newMessenger: (request, middleware) -> new Messenger request, middleware, @
	

	###
	###

	_validateListener: (route) ->

		return if @passive


		listeners = @_collection.get route.path, tags: route.tags, expand: false

		throw new Error "Route \"#{route.path.value}\" already exists" if !!listeners.length
		







