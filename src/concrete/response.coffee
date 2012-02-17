Writer = require "../io/writer"
Reader = require "../io/reader"
_      = require "underscore"
outcome = require "outcome"


class ResponseReader extends Reader

	###
	###

	_listenTo: () -> super().concat "headers"

	###
	###

	_listen: () ->
		super()
		@on "headers", (headers) => @headers = headers


	_dumpCached: (pipedReader) ->

		pipedReader.emit "headers", @headers if @headers

		super pipedReader


module.exports = class Response extends Writer

	###
	###

	constructor: (@messenger)  ->
		super()
		@_headers = {}
		@once "data", => @sendHeaders()
		@once "end", => @sendHeaders()

		


	###
	###
	header: (typeOrObj, value) ->
		

		if typeof typeOrObj == "object"
			_.extend @_headers, typeOrObj
		else
			@_headers[typeOrObj] = value
		@

	###
	 DEPRECATED
	###

	headers: (typeOrObj, value) -> @header typeOrObj, value
			
	###
	###
	
	##write: (chunk, encoding = "utf8") ->
	##	@sendHeaders()
	##	super chunk, encoding

	###
	###

	##end: (chunk, encoding = "utf8") ->
	##	@sendHeaders()
	##	super chunk, encoding

	
	###
	 wrap-around for error handling
	###

	success: (success) -> 

		if not @_outcome
			@_outcome = outcome.error (err) => @error err 

		@_outcome.success success

	###
	###

	sendHeaders: () ->
		return @ if @sentHeaders
		@sentHeaders = true
		@emit "headers", @_headers
		@

	###
	###

	reader: () -> new ResponseReader @

	
Writer::writable = true
