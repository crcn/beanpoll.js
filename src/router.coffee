crema 		   = require "crema"
MessageBuilder = require("./message").Builder
pushPlugin     = require("./push/plugin")
pullPlugin     = require("./pull/plugin")
collectPlugin  = require("./collect/plugin")
plugins        = require "./plugins"
disposable	   = require "disposable"



class Router
	
	###
	###
	
	constructor: () ->
		
		# gets plugged into by the plugin handler
		@directors = {}

		@_messageBuilder = new MessageBuilder @

		# registers the plugins to the router, and message writer
		@_plugins = new plugins @

		# register the default plugins
		# 1-many notification
		@use pushPlugin

		# 1-1 request
		@use pullPlugin

		# 1-many request
		@use collectPlugin

	###
	 uses a dispatcher
	###

	use: (plugin) -> @_plugins.add plugin
		
		
	###
	 listens for a request
	###
	
	on: (routeOrListeners, callback) ->

		listenerDisposables = disposable.create()
		
		# easier setting up listeners if it's an object vs
		# calling .on each time
		if typeof routeOrListeners == "object" and not callback
			for type of routeOrListeners
				listenerDisposables.add @.on(type, routeOrListeners[type])
			return listenerDisposables


		if typeof routeOrListeners == "string" 
			routes = crema routeOrListeners
		else if routeOrListeners instanceof Array
			routes = routeOrListeners
		else
			routes = [routeOrListeners]
						
		for route in routes
			do (route) =>	
				listenerDisposables.add @directors[route.type].addListener(route, callback)


				## notify the plugins of a new listener
				@_plugins.newListener route: route, callback: callback
					
		
		# finally return self
		listenerDisposables

	###
	###

	channels: (ops) -> 

		channels = []

		for name of @directors
			director = @directors[name]
			channels = channels.concat director.channels ops

		return channels
	
	###
	 abreviated
	###

	req: () -> @request.apply this, arguments

	###
	 Initializes a new request
	###

	request: (channel, query, headers) ->
			
		@_messageBuilder.
		clean().
		channel(if typeof channel is "string" then crema.parseChannel(channel) else channel).
		query(query).
		headers(headers);

		


module.exports = Router