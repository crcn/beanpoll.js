Reader = require "./io/reader"
Writer = require "./io/writer"





class Message extends Reader
	
	###
	 constructor
	###
	
	constructor: (writer, @channel, @query = {}, @headers = {}, @callback) ->
		super writer



	
	
	
exports.Writer = class extends Writer

	###
	###

	constructor: (@channel, @router, @_ops) ->
		super()

	###
	###

	prepare: (@channel, @router, @_ops) ->
		@


	###
	 options which control how the request
	 is handled
	###

	options: (value) ->
		return @_ops if !arguments.length
		@_ops = value || {}
		@

	### 
	###

	query: (value) ->
		return @_ops.query if !arguments.length
		@_ops.query = value || {}
		@


	###
	###

	headers: (value) ->
		return @_ops.headers if !arguments.length
		@_ops.headers = value || {}
		@
		

	###
	 response handler for pull requests
	###

	response: (callback) ->
		return @_ops.callback if !arguments.length
		@_ops.callback = callback
		@


	###
	###

	pull: (query, callback) ->
		
		if typeof query == 'function'
			callback = query
			query    = null

		@query(query) if !!query
		@response(callback) if !!callback

		# start piping data to the new reader
		msg = @_newReader()

		# pull the request now
		@router._pullDispatcher.dispatch msg

		# return self so we can start piping stuff
		@

	###
	###

	push: (data) ->
		
		msg = @_newReader()

		# push the request now
		@router._pushDispatcher.dispatch msg

		@end data if !!data

		# return self so we can start piping stuff
		@

	###
	###

	_newReader: () ->
		new Message @, 
			@channel, 
			@_ops.query,
			@_ops.headers,
			@_ops.callback