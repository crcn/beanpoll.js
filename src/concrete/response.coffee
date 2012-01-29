Writer = require "../io/writer"
_ = require "underscore"

module.exports = class Response extends Writer

	###
	###

	constructor: (@_messanger)  ->
		super()
		@_headers = {}

		
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
		super chunk, encoding
		

	###
	###

	sendHeaders: () ->
		if @sentHeaders then return @
		@sentHeaders = true
		@emit "headers", headers
		@

	
Writer::writable = true
