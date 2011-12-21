class RouteTree
	
	###
	###
	
	constructor: (@path) ->
		@listeners = []
		@_children = {}
		
	###
	###
	
	getChild: (path, create = false) ->
		
		if path not of @_children
			@_children[path] = new Collection path
		else
			@_children[path]
			
			
module.exports = class Collection 
	
	###
	###
	
	constructor: () ->
		@_children = {}
		@_tree = new RouteTree "/"
	
	###
	###
	
	addRouteListener: (listener) ->
		@_getTree(listener.route.channel).listeners.push listener
		
	###
	###
	
	getRouteListeners: (channel) ->
		@_getTree(channel, true).listeners
		
	###
	###
	
	hasRouteListener: (channel) ->
		!!@getRouteListeners(channel).length
	
	###
	###
	
	_getTree: (channel, find = false) ->
		
		currentTree = @_tree
		
		for path in channel.paths
			pathName = if path.param then "_param" else path.value
			newTree  = currentTree.getChild pathName, !find
			
			# DO find a tree
			if !newTree then current.getChild "_param", false
			
			currentTree = newTree
		
		currentTree
		