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
		@channel  = _ops.channel
		@tags     = _ops.tags
		@callback = _ops.callback
		@next	  = _ops.next
		@type     = _ops.type

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

	constructor: (@router) -> @clean()

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
		@to(@router)
		@


	###
	 filterable tags
	###
	
	tag: (key, value) ->
		return @_ops.tags if !arguments.length

		@_ops.tags = {} if not @_ops.tags

		if typeof key == 'string' 
			if arguments.length == 1 then return @_ops.tags[key]

			@_ops.tags[key] = value
		else
			@_ops.tags = key || {}

		@

	###
	###

	hasListeners: (search) -> 
		search = search ? { tags: @_ops.tags }
		!!@director.getListeners(channel: @_ops.channel, search).length

	###
	###

	type: (value) -> @_param 'type', arguments
		
	###
	###

	to: (value) -> @_param 'to', arguments
	
	###
	###

	channel: (value) -> @_param 'channel', arguments

	### 
	 Query would be something like ?name=craig&last=condon
	###

	query: (value) -> @_param 'query', arguments


	###
	 The header data explaining the message, such as tags, content type, etc.
	###

	headers: (value) -> @_param 'headers', arguments
		
	###
	 response handler, or ack
	 deprecated
	###

	response: (callback) -> @_param 'callback', arguments 

	###
	 append middleware to the end 
	###

	next: (middleware) -> @_param 'next', arguments

	###
	###

	dispatch: (type) ->
		@type type if type
		writer = new MessageWriter @_ops
		@_ops.to.dispatch writer
		writer

	###
	###

	_param: (name, args) ->
		return @_ops[name] if !arguments.length
		@_ops[name] = args[0]
		@

