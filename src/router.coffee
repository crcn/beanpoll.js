crema 		   = require "crema"
MessageBuilder = require("./message").Builder
pushPlugin     = require "./push/plugin"
pullPlugin     = require "./pull/plugin"
collectPlugin  = require "./collect/plugin"
plugins        = require "./plugins"
disposable	   = require "disposable"
_              = require "underscore"


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
	###

	using: () -> @_plugins.using()
		
		
	###
	 listens for a request
	###
	
	on: (routeOrListeners, ops, callback) ->
		
		if typeof ops == 'function' 
			callback = ops
			ops = {}
			

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

				route.type = ops.type if ops.type
				_.extend route.tags, ops.tags if ops.tags
				

				listenerDisposables.add @directors[route.type].addListener(route, callback)

				## notify the plugins of a new listener
				@_plugins.newListener route: route, callback: callback
					
		
		# finally return self
		listenerDisposables

	###
	###

	routeExists: (ops) -> 
		ops.channel = crema.parseChannel ops.channel if typeof ops.channel == 'string'

		if not ops.type
			for type of @directors
				return true if @directors[type].routeExists ops
			return false

		return @directors[ops.type].routeExists(ops);

	###
	###

	channels: (ops) -> 

		channels = []

		for name of @directors
			director = @directors[name]
			channels = channels.concat director.channels ops

		return channels


	dispatch: (messageWriter) -> @directors[messageWriter.type].dispatch(messageWriter)
	
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