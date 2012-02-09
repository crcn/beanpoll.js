Reader = require "./io/reader"
Writer = require "./io/writer"
outcome = require "outcome"





exports.Reader = class MessageReader extends Reader
	
	###
	 constructor
	###
	
	constructor: (@writer, @from, @channel, @query, @sanitized = {}, @headers = {}, @filter = {}, @callback = null) ->
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
		@sanitized = _ops.sanitized


		super()


	###
	###

	reader: (index, numListeners) ->
		return new MessageReader @, 
			@from,
			@channel, 
			@query,
			@sanitized,
			@headers,
			@filter,
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
		@_objParam 'filter', arguments, (value) ->

			if typeof value == 'boolean'
				return { $exists: value }

			return value
	
	###
	 DEPRECATED
	###

	headers: (value) -> @header value

	###
	 The header data explaining the message, such as tags, content type, etc.
	###

	header: (keyOrHeaders, value) -> @_objParam 'headers', arguments

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
	 data that has been cleaned up after validation
	###

	sanitized: (value) -> @_param 'sanitized', arguments

		
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
	 DEPRECATED
	###

	hasListeners: () ->  @exists()

	###
	###

	exists: () -> !!@router.director(@type()).getListeners({channel: @_ops.channel, filter: @_ops.filter }, false).length

	###
	###

	_param: (name, args) ->
		return @_ops[name] if !args.length
		@_ops[name] = args[0]
		@

	
	###
	###

	_objParam: (name, args, getValue) ->
		return @_ops[name] if !args.length

		@_ops[name] = {} if not @_ops[name]

		keyOrObj = args[0]
		value    = args[1]

		
		# obj(key, value)
		if typeof keyOrObj == 'string' 
			
			# just one arg passed? return the value
			if args.length == 1 then return @_ops.headers[keyOrObj]

			@_ops[name][keyOrObj] = if getValue then getValue value else value

		else
			@_objParam name, [key, keyOrObj[key]], getValue for key of keyOrObj

		@

