Stream = require("stream").Stream
Reader = require "reader"

module.exports = class extends Stream
	
	###
	###
	
	constructor: () ->
		@_headers = {}
		@pipe @reader = new Reader()

		
	###
	###
	
	headers: (typeOrObj, value) ->
		if typeof typeOrObj == "object"
			_.extend @_headers typeOrObj
		else
			@_headers[typeOfObj] = value
			
	###
	###
	
	write: (chunk, encoding = "utf8") ->
		@sendHeaders
		@emit chunk, encoding
		
	###
	###
	
	end: (chunk, encoding) ->
		@write chunk, encoding if chunk
		@

	###
	###

	sendHeaders: () ->
		if @_headersSent then return
		@_headersSent = true
		@emit "headers", headers
	
Writer::writable = true
