Message = require './message'
_ 		= require 'underscore'

module.exports = class 
	
	###
	###

	constructor: (@router) ->
		@_pluginsByName = {}

	###
	###

	add: (plugin) -> 

		## create the module
		mod = plugin @router

		## assign by the name
		@_pluginsByName[mod.name] = mod

		## extending the prototype of the message
		_.extend @router._messageBuilder, mod.message 


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

