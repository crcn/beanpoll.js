crema 		   = require "crema"
RequestBuilder = require("./request").Builder
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

		# expose the parser - crema really is a private lib - it could change
		# anytime. This makes things a little more abstracted, a little more maintainable. That and dryer.
		@parse = crema

		@_requestBuilder = new RequestBuilder @

		# registers the plugins to the router, and request writer
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
		
		if not callback
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

				listenerDisposables.add @director(route.type).addListener(route, callback)

				## notify the plugins of a new listener
				@_plugins.newListener route: route, callback: callback
					
		
		# finally return self
		listenerDisposables


	###
	 returns the given director, or throws an error if it doesn't exist
	###

	director: (type) ->
		director = @directors[type]
		throw new Error "director #{type} does not exist" if not director
		return director

	###
	###

	paths: (ops) -> 

		paths = []

		for name of @directors
			director = @directors[name]
			paths = paths.concat director.paths ops

		return paths


	dispatch: (requestWriter) -> @director(requestWriter.type).dispatch(requestWriter)
	
	###
	 abreviated
	###

	req: () -> @request.apply this, arguments

	###
	 Initializes a new request
	###

	request: (path, query, headers) ->
			
		@_requestBuilder.
		clean().
		path(if typeof path is "string" then crema.parsePath(path) else path).
		query(query).
		headers(headers);


		


module.exports = Router