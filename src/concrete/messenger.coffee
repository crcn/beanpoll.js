LinkedQueue = require "../collections/linkedQueue"
Response    = require "./response"
_ 		    = require "underscore"

module.exports = class extends LinkedQueue
	
	###
	 constructor
	###
	
	constructor: (@request, @first, @director) ->

		# DEPRECATED
		@request = @request

		@router   = director.router 
		@from = request.from
		super first
			
		# ack callback
		@response = new Response @

		# dump the data into the ack
		@response.reader().dump () => 
			@request.callback.apply @request, arguments
		, @request.headers

	###
	###

	start:() -> @next()


	###
	###

	data: (name) -> 

		if arguments.length == 0
			return _.extend {}, @request.sanitized, @current.params, @request.query
		else if	arguments.length > 1 
			obj = {}
			for name in arguments
				obj[name] = @data(name)
			obj


		return @request.sanitized[name] || @current.params[name] || (if @request.query then @request.query[name] else null)


	###
	 flattens all param data into one object 
	###

	flattenData: (reset) ->
		return @_allData if @_allData and not reset

		cur = @current
		allData = _.defaults(cur.params, @request.query)

		cur = cur.getNextSibling()
		
		while cur
			_.defaults(allData, cur.params)
			cur = cur.getNextSibling()
		
		return @_allData = allData

	###
	### 

	_onNext: (middleware, args) ->

		if args and args.length

			## error? Do not continue
			if args[0]
				return _onError args[0]	
			else
				_onNextData args[1]		


		@request.params = middleware.params
			

		try
			## if we're not at the end, then cache incomming data.
			@request.cache @hasNext

			@_next middleware, args

		catch e
			@response.error e


	###
	###
	
	_next: (middleware) -> middleware.listener @

	###
	###

	_onError: (error) -> #override me


	###
	###

	_onNextData: () -> #override me
	
		
		
