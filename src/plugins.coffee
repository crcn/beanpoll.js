Request = require './request'
_ 		= require 'underscore'

module.exports = class 
	
	###
	###

	constructor: (@router) ->
		@_pluginsByName = {}
		@_using = [];

	using: () -> @_using

	###
	###

	add: (plugin) -> 

		if plugin instanceof Array
			for plg in plugin
				@add plg
			return
		
		@_using.push plugin

		## create the module
		mod = plugin @router

		## assign by the name
		@_pluginsByName[mod.name] = mod

		## extending the prototype of the request
		_.extend @router._requestBuilder, mod.request 


		## extend the router
		_.extend @router, mod.router

		## set the dispatcher
		@router.directors[mod.name] = mod.director if mod.director


	###
	###

	get: (name) -> @_pluginsByName[name]


	###
	 Used incase the listener needs to be handler for a particular reason, e.g: push -pull /some/route would be a binding.
	###

	newListener: (listener) -> @_emit 'newListener', listener


	###
	###

	_emit: (type, data) ->	
		for pluginName of @_pluginsByName
			plugin = @_pluginsByName[pluginName]
			plugin[type](data) if plugin[type]

