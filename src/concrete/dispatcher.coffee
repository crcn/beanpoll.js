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
	 dispatches a request
	###
	
	dispatch: (message) ->
		
		# find the listeners based on the channel given
		listeners = @_collection.getRouteListeners message.channel

		
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
	
	addRouteListener: (route, listener) ->
		route = @_prepareRoute route
		listener.route = route
		@_collection.addRouteListener listener
		
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
