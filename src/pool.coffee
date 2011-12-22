
module.exports = class Pool

	###
	###

	constructor: (@clazz, @maxSize = 10) ->
		@pool = []

	###
	###

	push: (obj) ->
		if @pool.length < @maxSize
			@pool.push obj 
			obj.clean()

	
	###
	###

	pop: () ->
		return if @pool.length then @pool.pop() else new @clazz

	###
	###

	empty: () ->
		!@pool.length


Pool.poolable = (clazz) ->

	pool = clazz.pool = new Pool clazz

	clazz.create = () => pool.pop()