Reader = require "./io/reader"
Writer = require "./io/writer"





class Message extends Reader
	
	###
	 constructor
	###
	
	constructor: (writer, @channel, @query = {}, @headers = {}, @tags = {}, @callback) ->
		super writer



	
	
	
exports.Writer = class MessageWriter extends Writer

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
	 returns number of listeners based on type and passed channel
	###

	numListeners: (type) -> @router._dispatchers[type].numListeners(@channel)

	###
	 filterable tags
	###
	
	tags: (value) ->
		return @_ops.tags if !arguments.length
		@_ops.tags = value || {}
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

	pull: (query, callback) -> @_pull query, callback, @router._dispatchers.pull

	###
	###

	collect: (query, callback) -> @_pull query, callback, @router._dispatchers.collect


	###
	###

	push: (data) ->
		
		msg = @_newReader()

		# push the request now
		@router._dispatchers.push.dispatch msg

		@end data if data != undefined

		# return self so we can start piping stuff
		@


	###
	###

	_pull: (query, callback, dispatcher) ->
		
		if typeof query == 'function'
			callback = query
			query    = null

		@query(query) if !!query
		@response(callback) if !!callback

		# start piping data to the new reader
		msg = @_newReader()

		# pull the request now
		dispatcher.dispatch msg

		# return self so we can start piping stuff
		@

	###
	###

	# end: (data, encoding) ->
	#	super data, encoding
	#	MessageWriter.pool.push @

	###
	###

	# clean: () ->
	#	@_events = {};

	###
	###

	_newReader: () ->

		new Message @, 
			@channel, 
			@_ops.query,
			@_ops.headers,
			@_ops.tags,
			@_ops.callback



# require('./pool').poolable exports.Writer

