EventEmitter = require('events').EventEmitter


module.exports = class LinkedQueue extends EventEmitter
	
	_hasNext: true
	
	###
	 moves into the next
	###
	
	constructor: (@first, onNext) ->
		super()
		@last = first.getLastSibling()
		@_onNext = onNext if onNext
		
	###
	 moves onto the next request (middleware)
	###

	next: ->

		# no more middleware? return false - flag that we cannot continue
		return false if !@_hasNext

		@_setNext()

		@_onNext @current

		# return true since the next route has been executed successfuly
		return true

	###
	 skips middleware
	###

	skipNext: (count) ->

		return false if !!@_hasNext

		while count-- and @_hasNext
			@_setNext()

		@_onNext @current

		return true

	###
	 flag whether we can continue with middleware
	###

	hasNext: ->
		@_hasNext


	###
	###
	
	_setNext: ->
		@current = if !!@current then @current.getNextSibling() else @first
		@_hasNext = !!@current.getNextSibling()

		if !@_hasNext then @emit "queueComplete"
		
	###
	###
	
	_onNext: (middleware) ->
		# abstract	
		
module.exports = LinkedQueue