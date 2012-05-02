Stream = require("stream").Stream
disposable = require("disposable")



module.exports = class Reader extends Stream
	
	###
	###
	
	constructor: (@source) ->
		super()

		# we do not want any warnings from node. Fucking obnoxious, 
		# useless code.
		@setMaxListeners(0)

		@_listen()
		
	
	###
	 needs to be overridable incase there's more stuff to listen to (headers)
	###

	_listenTo: () -> ["data", "end", "error"]

	###
	###

	_listen: () ->

		@_buffer = []
		listeners = disposable.create()


		# source given? need to pipe some stuff
		if @source
			for event in @_listenTo()
				do(event) =>
						
					# arg1 = data if present
					# arg2 = encoding usually

					onEvent = (arg1, arg2) => 
						#flag for the reader that data has already been transmitted
						@_started = true
						@emit event, arg1, arg2

					# pipe it.
					@source.on event, onEvent
					listeners.add () =>
						@source.removeListener event, onEvent

	
		@on "data", (data, encoding) =>


			# do NOT store cache in the buffer if this flag is FALSE
			return if not @_cache


			# otherwise cache
			@_buffer.push { chunk: data, encoding: encoding }

		# listen for end, then flag as finished
		@on "end", () => 
			throw new Error("Cannot end more than once") if @ended
			@ended = true
			# listeners.dispose()

		@on "error", (err) => @error = err

	###
	###
	
	setEncoding: (encoding) -> @source?.setEncoding(encoding)
		
	###
	###
	
	pause: () -> @source?.pause?()
		
	###
	###
	
	resume: () -> @source?.resume?()

	###
	###
	
	destroy: () -> @source?.destroy?()

	###
	###
		
	destroySoon: () -> @source?.destroySoon?()

	###
	 flags the reader that data should be cached as it's coming in.
	###

	cache: (value) ->

		# data already being cached? too late!
		@_cache = value or !!@_buffer.length if arguments.length
		@_cache 


	###
 	 listens on a reader, and pipes it to a callback a few ways
	###

	dump: (callback, ops) ->

		ops = {} if not ops


		# wrap the callback
		wrappedCallback = @_dumpCallback callback, ops
			
		# has the stream already started? need to create a NEW reader so any 
		# OTHER calls on dump() don't emit the same data twice.
		pipedStream = if @_started then new Reader @ else @

		#send the wrapped stream
		wrappedCallback.call @, null, pipedStream

		# not started? sweet! we don't have to dump the cached data
		return if not @_started

		# start dumping the cache into the reader
		@_dumpCached pipedStream, ops

	###
	###

	_dumpCallback: (callback, ops) ->

		if callback instanceof Stream
			ops.stream = true
			pipeTo     = callback
			callback = (err, stream) =>
				for type in @_listenTo()
					do (type) =>
						stream.on type, () => pipeTo.emit.apply pipeTo, [type].concat Array.prototype.slice.call arguments
				null
			
						

		# if the callback is an object, then it's a listener ~ a piped stream
		if typeof callback == 'object'

			# turn into a stream
			ops.stream = true

			#listeners, are given so this is a bit more approriate
			listeners = callback

			# need to replace the callback. When the Stream is returned, 
			# the listeners are attached to the given stream
			callback = (err, stream) ->
				stream.on type, listeners[type] for type of listeners 


		return callback if ops.stream

		# not streaming? the callback expects ALL the content to come at once,
		# so we need to return something that catches it, and does shit on end. Depends on the options
		# given
		return (err, reader) =>

			# error to boot? do NOT continue
			return callback err if err

			buffer = [];

			onEnd = (err) =>

				
				# content needs to be sent back as an array?
				return callback.call @, err, buffer if ops.batch

				# no data to return?
				return callback.call @, err if not buffer.length

				# treat the callback as a foreach func?
				if ops.each
					callback.call @, err, chunk for chunk in buffer

				# otherwise try sending the first chunked data back, or the array if the buff
				# length is greater than 2. Note this is implemented because it'd be a pain in the ass
				# to always call response[0]. The ops.batch flag exists BECAUSE of that.
				else
					callback.call @, err, if buffer.length > 1 then buffer else buffer[0]


			# start listening to piped data
			reader.on "data", (data, encoding) -> buffer.push(data)
			reader.on "error", onEnd
			reader.on "end", onEnd

	###
	###

	_dumpCached: (pipedReader) ->


		pipedReader.emit "data", data.chunk, data.encoding for data in @_buffer 
		pipedReader.emit "end" if @ended
		pipedReader.emit "error" if @error
		
		
Reader::readable = true



		