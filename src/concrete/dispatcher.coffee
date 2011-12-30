RouteCollection   = require "./routeCollection"
RequestMiddleware = require "./middleware"
crema = require "crema"


module.exports = class AbstractDispatcher
	
	###
	 constructor
	###
	
	constructor: (@router) ->
		@_collection = new RouteCollection();

	###
	 returns number of listeners based on channel given
	###

	numListeners: (channel, ops) -> @_filterListeners(@_collection.getRouteListeners(channel), ops).length
	
	###
	 dispatches a request
	###
	
	dispatch: (message) ->
		
		# find the listeners based on the channel given
		listeners = @_prepareRequest message

		
		# in pull bases, there will only be one listener. For push, there maybe multiple
		for listener in listeners

			# since requests can modify the messages - need to copy
			messageClone = message # message.clone();

			# fetch the middleware for the given listener 
			middleware   = RequestMiddleware.expand messageClone.channel, listener, @

			# pass through the factory class which creates a new request, OR uses a recycled request 
			messanger	     = @_newMessanger messageClone, middleware

			# initialize!
			messanger.start()
		@
		
	###
	 adds a route listener to the collection tree
	###
	
	addRouteListener: (route, callback) ->
		route = @_prepareRoute route
		@_collection.addRouteListener callback: callback, route: route
		
	###
	 returns a new request
	###
	
	_newMessanger: (message, middleware) ->
		# override me.
		

	###
	 validates a listener to make sure it doesn't conflict with existing listeners
	###

	_prepareRoute: (route) ->

		# override me
		route

	###
	###

	_findListeners: (route, param) ->

		# find the listeners based on the channel given
		@_filterListeners @_collection.getRouteListeners(route.channel, param), route.tags
		
	###
	###
	
	_prepareRequest: (message) -> @_findListeners message	

	###
	###

	_filterListeners: (listeners, tags) ->

		filtered = listeners.concat()

		# filter based on tag names
		for tagName of tags
			
			value = tags[tagName]

			continue if value is 1

			for listener, i in filtered


				break if listener.route.tags.unfilterable

				tagV = listener.route.tags[tagName]

				if (tagV isnt value) and (tagV isnt "*") 
					filtered.splice i--, 1
					_len--;


		return filtered