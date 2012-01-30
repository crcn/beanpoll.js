Stream = require("stream").Stream



module.exports = class Reader extends Stream
	
	###
	###
	
	constructor: (@source, ops) ->
		super()

		@setMaxListeners(0)


		if source
			source.on "data", (data) => @emit "data", data
			source.on "end", (data) => @emit "end"
			source.on "error", (err) => @emit "error", err
				


		if ops and ops.cache
			@cache true
			@dump()

		@_buffer = []

	
		@on "data", (data) =>
			return if not @_cache
			@_buffer.push data

		@on "end", () => @ended = true
		@on "pipe", (source) => @source = source
	
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
	 flags the reader that data should be cached as it's coming in.
	###

	cache: (value) ->

		# data already being cached? too late then.
		@_cache = value or !!@_buffer.length if arguments.length
		@_cache 

	###
 	 listens on a reader, and pipes it to a callback a few ways
	###

	dump: (callback, ops) ->

		ops = {} if not ops

		
		if typeof callback == 'object'
			ops.stream = true
			listeners = callback

			# replace the callback now
			callback = (err, stream) ->
				for type of listeners 
					stream.on type, listeners[type]
					

		# streaming the data? needs to be piped then since we're emitting buffered data
		pipedStream = if ops.stream then new Reader @ else @

		if ops.stream
			callback.call @, null, pipedStream
			return if not @_cache

		buffer =  []


		onEnd = (err) =>

			
			# don't do anything if we're streaming data
			return null if ops.stream

			# sending the buffered data as a single response?
			return callback.call @, err, buffer if ops.batch

			# no data returned? 
			return callback(err) if not buffer.length

			if ops.each
				for chunk in buffer
					callback.call @, err, chunk
			else
				callback.call @, err, if buffer.length > 1 then buffer else buffer[0]
		

		@on "data", (chunk) =>  buffer.push chunk
		@on "end", onEnd
		@on "error", onEnd

		
		if @_buffer 
			for chunk in @_buffer 

				# raw stream passed - then pipe the data
				if ops.stream then pipedStream.emit "data", chunk
				buffer.push chunk
			
				
		if @ended
			if ops.stream
				pipedStream.emit "end"
			else
				onEnd false
		
		
Reader::readable = true



		