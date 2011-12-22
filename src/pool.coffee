
module.exports = class 

	###
	###

	constructor: (@clazz, maxSize = 10) ->
		@pool = []

	###
	###

	push: (obj) ->
		@pool.push obj

	
	###
	###

	pop: () ->
		return if @pool.length then @pool.pop() else new @clazz

	###
	###

	empty: () ->
		!@pool.length
