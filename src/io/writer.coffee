Stream = require("stream").Stream
Reader = require "./reader"

module.exports = class Writer extends Stream
	
	constructor: () ->
		super()
		@setMaxListeners(0)
	
	###
	###
	error: (err) ->
		err = new Error(err) if typeof err == 'string'
		@emit "error", err
			
	###
	###
	
	write: (chunk, encoding = "utf8") ->
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

	reader: () ->
		return new Reader @
	
Writer::writable = true
