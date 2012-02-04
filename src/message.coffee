Reader = require "./io/reader"
Writer = require "./io/writer"
outcome = require "outcome"





exports.Reader = class MessageReader extends Reader
	
	###
	 constructor
	###
	
	constructor: (@writer, @from, @channel, @query, @headers = {}, @callback = null) ->
		super writer

		

exports.Writer = class MessageWriter extends Writer

	###
	###

	constructor: (@_ops) -> 

		@channel  = _ops.channel
		@callback = _ops.callback
		@next	  = _ops.next
		@filter   = _ops.filter or {}
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
	
	tag: (keyOrTags, value) ->
		return @_ops.filter if !arguments.length

		@_ops.filter = {} if not @_ops.filter

		if typeof keyOrTags == 'string' 
			if arguments.length == 1 then return @_ops.filter[keyOrTags]

			if typeof value == 'boolean'
				value = { $exists: value }

			@_ops.filter[keyOrTags] = value
		else
			@tag key, keyOrTags[key] for key of keyOrTags

		@

	###
	 DEPRECATED
	###

	hasListeners: () -> @exists()

	###
	###

	exists: () -> !!@router.director(@type()).getListeners({channel: @_ops.channel }).length

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

