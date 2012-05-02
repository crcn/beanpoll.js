Stream = require("stream").Stream
Reader = require "./reader"

module.exports = class Writer extends Stream
	
	constructor: () ->
		super()
		@_paused = false
		@_reallyResumed = true
		@setMaxListeners(0)
		@on "pipe", (src) =>
			@_source = src
			@_source.pause() if @_paused

	
	###
	###
	error: (err) ->
		err = new Error(err) if typeof err == 'string'
		@emit "error", err
			
	###
	###
	
	write: (chunk, encoding = "utf8") ->
		return false if @_paused
		@emit "data", chunk, encoding
		
	###
	###
	
	end: (chunk, encoding) ->
		@write chunk, encoding if chunk
		throw new Error "Cannot call end twice" if @ended
		@ended = true
		@emit "end"
		@

	###
	###

	pause: () -> 
		clearInterval @_resumeTimeout
		@_source?.pause?() if not @_reallyResumed
		@_paused = true

	###
	###

	resume: () -> 
		@_paused = false
		clearInterval @_resumeTimeout
		@_resumeTimeout = setTimeout ( () =>
			return if @_paused
			@_reallyResumed = true
			@_source?.resume?()
			), 1

	###
	###

	destroy: () ->
		## called by node.js on pipe

	###
	###

	reader: () ->
		return new Reader @


	###
	###

	_resume: () ->
	
Writer::writable = true
