LinkedQueue = require "../collections/linkedQueue"
Response = require "./response"

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
		@response.reader().dump (() => @message.callback.apply @message, arguments), @message.headers

	###
	###

	start:() -> @next()

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
			

		@_next middleware, args

	###
	###
	
	_next: (middleware) -> middleware.listener @

	###
	###

	_onError: (error) -> #override me


	###
	###

	_onNextData: () -> #override me
	
		
		
