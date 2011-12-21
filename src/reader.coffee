Stream = require("stream").Stream

module.exports = class Reader extends Stream
	
	###
	###
	
	constructor: (ops) ->
		super()
		@addEventListener "pipe", (source) =>
			@source = source

		@addEventListener "end", () =>
			@ended = true

		if ops.cache
			@cache true
			@dump()
	
	###
	###
	
	setEncoding: (encoding) ->
		@source?.setEncoding(encoding)
		
	###
	###
	
	pause: () ->
		@source?.pause?()
		
	###
	###
	
	resume: () ->
		@source?.resume?()

	###
	###
	
	destroy: () ->
		@source?.destroy?()

	###
	###
		
	destroySoon: () ->
		@source?.destroySoon?()

	###
	###

	cache: (value) ->
		@_cache = value if arguments.length
		@_cache 

	###
 	 listens on a reader, and pipes it to a callback a few ways
	###

	dump: (callback, ops) ->
		
		# ability to dump data without providing a callback. Useful for caching
		if typeof callback == 'object'
			ops = callback
			callback = () ->

		# streaming the data? needs to be piped then since we're emitting buffered data
		pipedStream = if ops.stream then new Reader else @
		
		# stream data? don't continue then...
		return callback.call @, @stream if ops.stream and not ops.cache

		buffer =  []

		onEnd = (err) =>
			
			return null if err or ops.stream
			return callback.call @, err, buffer if ops.batch
			return callback() if not buffer.length

			for chunk in buffer
				callback.call @, err, chunk


		@on "data", (chunk) => 
			buffer.push chunk

			# final call to cache data - maybe used at the last sec. See push messanger
			@_buffer = buffer if not @_buffer and @cache

		@on "end", onEnd
		@on "error", onEnd

		
		for chunk in @_buffer

			# raw stream passed - then pipe the data
			if ops.stream then pipedStream.emit "data", chunk
			buffer.push chunk

		if @ended
			if ops.stream
				pipedStream.emit "end", chunk
			else
				onEnd false
		
		
Reader::readable = true



		