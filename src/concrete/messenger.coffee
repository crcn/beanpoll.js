LinkedQueue = require "../collections/linkedQueue"
Response = require "./response"
_ = require "underscore"

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
	 returns param, or query data
	###

	data: (name) -> 

		if arguments.length == 0
			return _.extend {}, @current.params, @message.query
		else if	arguments.length > 1 
			obj = {}
			for name in arguments
				obj[name] = @data(name)
			obj

		return @current.params[name] || @message.query[name];

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

		if args.length

			## error? Do not continue
			if args[0]
				return _onError args[0]	
			else
				_onNextData args[1]		


		@message.params = middleware.params
			

		try

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
	
		
		
