class RouteTree
	
	###
	###
	
	constructor: (@path) ->
		@listeners = []
		@_children = {}
		
	###
	###
	
	getChild: (path, create = false) ->
		
		if path not of @_children and create
			@_children[path] = new RouteTree path
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
		tree = @_getTree(channel, true)
		if tree then tree.listeners else []
		
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
			if not newTree then newTree = currentTree.getChild "_param", false
			return null if not newTree
			
			currentTree = newTree
		
		currentTree
		