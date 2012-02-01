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
			return _.extend {}, @params, @query
		else if	arguments.length > 1 
			obj = {}
			for name in arguments
				obj[name] = @data[name]
			obj

		return @params[name] || @query[name];

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
	
		
		
