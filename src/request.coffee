Reader = require "./io/reader"
Writer = require "./io/writer"
outcome = require "outcome"





exports.Reader = class RequestReader extends Reader
	
	###
	 constructor
	###
	
	constructor: (@writer, @from, @path, @query, @sanitized = {}, @headers = {}, @filter = {}, @callback = null) ->
		super writer



		

exports.Writer = class RequestWriter extends Writer

	###
	###

	constructor: (@_ops) ->  

		@next	   = _ops.next
		@pre	   = _ops.pre
		@path      = _ops.path
		@type      = _ops.type
		@from	   = _ops.from
		@query     = _ops.query
		@filter    = _ops.filter or {}
		@headers   = _ops.headers
		@callback  = _ops.callback
		@sanitized = _ops.sanitized

		super()


	###
	###

	reader: () ->
		return new RequestReader @, 
			@from,
			@path, 
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
	 DEPRECATED
	###
	
	tag: (keyOrTags, value) -> 
		@_objParam 'filter', arguments, (value) ->

			if typeof value == 'boolean'
				return { $exists: value }

			return value

	filter: (keyOrTag, value) ->
		@tag keyOrTag, value
	
	###
	 DEPRECATED
	###

	headers: (value) -> @header value

	###
	 The header data explaining the request, such as tags, content type, etc.
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

	path: (value) -> @_param 'path', arguments

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
		writer = new RequestWriter @_ops
		@router.dispatch writer
		writer

	###
	 DEPRECATED
	###

	hasListeners: () ->  @exists()

	###
	###

	exists: () -> !!@listeners().length

	###
	###

	listeners: () -> @router.director(@type()).getListeners({path: @_ops.path, filter: @_ops.filter }, false)

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

