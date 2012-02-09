LinkedQueue = require "../collections/linkedQueue"
Response    = require "./response"
_ 		    = require "underscore"

module.exports = class extends LinkedQueue
	
	###
	 constructor
	###
	
	constructor: (@message, @first, @director) ->
		@router   = director.router 
		@from = message.from
		super first
			
		# ack callback
		@response = new Response @

		# dump the data into the ack
		@response.reader().dump () => 
			@message.callback.apply @message, arguments
		, @message.headers

	###
	###

	start:() -> @next()


	###
	###

	data: (name) -> 

		if arguments.length == 0
			return _.extend {}, @message.sanitized, @current.params, @message.query
		else if	arguments.length > 1 
			obj = {}
			for name in arguments
				obj[name] = @data(name)
			obj


		return @message.sanitized[name] || @current.params[name] || (if @message.query then @message.query[name] else null)

	###
	 flattens all param data into one object 
	###

	flattenData: (reset) ->
		return @_allData if @_allData and not reset

		cur = @current
		allData = _.defaults(cur.params, @message.query)

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


		@message.params = middleware.params
			

		try
			## if we're not at the end, then cache incomming data.
			@message.cache @hasNext

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
	
		
		
