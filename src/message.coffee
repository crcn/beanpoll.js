Reader = require "./io/reader"
Writer = require "./io/writer"





class MessageReader extends Reader
	
	###
	 constructor
	###
	
	constructor: (@writer, @channel, @query = {}, @headers = {}, @tags = {}, @callback) ->
		super writer

		

class MessageWriter extends Writer

	###
	###

	constructor: (@_ops) -> 
		@channel = _ops.channel
		@tags    = _ops.tags
		@callback = _ops.callback
		super()


	###
	###

	reader: (index, numListeners) ->
		return new MessageReader @, 
			@channel, 
			@_ops.query,
			@_ops.headers,
			@tags,
			@callback

	
	
exports.Builder = class

	###
	###

	constructor: (@router) ->

	###
	 options which control how the request
	 is handled. This can fill out the entire request vs using the methods given
	###

	options: (value) ->
		return @_ops if !arguments.length
		@_ops = value || {}
		@

	###
	###

	clean: () ->
		@_ops = {}
		@


	###
	 filterable tags
	###
	
	tag: (key, value) ->
		return @_ops.tags if !arguments.length

		if typeof key == 'string' 
			if arguments.length == 1 then return @_ops.tags[key]

			@_ops.tags[key] = value
		else
			@_ops.tags = key || {}

		@

	###
	###

	hasListeners: () -> 
		@director.hasListeners(channel: @_ops.channel, tags: @_ops.tags)

	type: (value) ->
		return @_ops.type if !arguments.length
		@_ops.type = value || {}

		@director = @router.directors[value]

		throw new Error "type #{value} does not exist" if not @director

		@
		
	
	###
	###

	channel: (value) ->
		return @_ops.channel if !arguments.length
		@_ops.channel = value || {}
		@

	### 
	 Query would be something like ?name=craig&last=condon
	###

	query: (value) ->
		return @_ops.query if !arguments.length
		@_ops.query = value || {}
		@


	###
	 The header data explaining the message, such as tags, content type, etc.
	###

	headers: (value) ->
		return @_ops.headers if !arguments.length
		@_ops.headers = value || {}
		@
		

	###
	 response handler, or ack
	 deprecated
	###

	response: (callback) ->
		return @_ops.callback if !arguments.length
		@_ops.callback = callback
		@

	###
	###

	dispatch: (type) ->
		@type type if type
		writer = new MessageWriter @_ops
		@director.dispatch writer
		writer

