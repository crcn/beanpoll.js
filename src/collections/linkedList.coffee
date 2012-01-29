module.exports = class LinkedList
	
	###
	###
	getNextSibling: () ->
		return @_nextSibling
	
	###
	###
	addNextSibling: (sibling, replNext) ->
		@_nexSibling._prevSibling = sibling if !!@_nextSibling; 
		sibling._prevSibling = @
		sibling._nextSibling = @_nextSibling if not replNext
		@_nextSibling 		 = sibling
		
	###
	###

	getPrevSibling: () ->
		return @_prevSibling
		
	###
	###
	addPrevSibling: (sibling, replPrev) ->
		@_prevSibling._nextSibling = sibling if !!@_prevSibling;
		sibling._nextSibling = @
		sibling._prevSibling = @_prevSibling if not replPrev
		@_prevSibling = sibling
		
	###
	###
	getFirstSibling: () ->
		first = @

		
		first = first._prevSibling while !!first._prevSibling

		return first
	
	###
	###
	
	getLastSibling: () ->
		last = @
		
		last = last._nextSibling while !!last._nextSibling
		
		return last
			