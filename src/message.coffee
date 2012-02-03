Reader = require "./io/reader"
Writer = require "./io/writer"
outcome = require "outcome"





exports.Reader = class MessageReader extends Reader
	
	###
	 constructor
	###
	
	constructor: (@writer, @from, @channel, @query, @headers = {}, @tags = {}, @callback = null) ->
		super writer

		

exports.Writer = class MessageWriter extends Writer

	###
	###

	constructor: (@_ops) -> 

		@channel  = _ops.channel
		@tags     = _ops.tags
		@callback = _ops.callback
		@next	  = _ops.next
		@pre	  = _ops.pre
		@type     = _ops.type
		@from	  = _ops.from
		@headers  = _ops.headers
		@query    = _ops.query

		super()


	###
	###

	reader: (index, numListeners) ->
		return new MessageReader @, 
			@from,
			@channel, 
			@query,
			@headers,
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
		@from(@router)


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


		!!@router.director(@type()).getListeners({channel: @_ops.channel }, search).length

	###
	###

	type: (value) -> @_param 'type', arguments

	###
	###

	from: (value) -> @_param 'from', arguments
		
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

	response: (callback) -> @_param 'response', arguments 

	###
	 on error callback
	###

	error: (callback) -> @_param 'error', arguments

	###
	 on success callback
	###

	success: (callback) -> @_param 'success', arguments

	###
	 append middleware to the end 
	###

	next: (middleware) -> @_param 'next', arguments

	###
	 prepend middleware
	###

	pre: (middleware) -> @_param 'pre', arguments

	###
	###

	dispatch: (type) ->
		
		@_ops.callback = outcome error: @error(), success: @success(), callback: @response()
		
		@type type if type
		writer = new MessageWriter @_ops
		@router.dispatch writer
		writer

	###
	###

	_param: (name, args) ->
		return @_ops[name] if !args.length
		@_ops[name] = args[0]
		@

