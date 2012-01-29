LinkedQueue = require "../collections/linkedQueue"

module.exports = class extends LinkedQueue
	
	###
	 constructor
	###
	
	constructor: (@message, @first, @director) ->
		@router   = director.router 
		super first
	

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
	
		
		
