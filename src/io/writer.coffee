Stream = require("stream").Stream
Reader = require "./reader"

module.exports = class Writer extends Stream
	
	constructor: () ->
		@setMaxListeners(0)
	
	###
	###
	error: (err) ->
		@emit "error", err
			
	###
	###
	
	write: (chunk, encoding = "utf8") ->
		@emit "data", chunk, encoding
		
	###
	###
	
	end: (chunk, encoding) ->
		@write chunk, encoding if chunk
		@emit "end"
		@

	###
	###

	reader: () ->
		return new Reader @
	
Writer::writable = true
