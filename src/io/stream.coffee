Stream = require("stream").Stream


module.exports = class extends Stream

	###
	###

	constructor: () ->
		
		@on "pipe", (source) =>
			@_onPipe source

	###
	###

	_onPipe: (source) ->
		@source = source