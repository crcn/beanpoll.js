module.exports = class LinkedList
	
	###
	###
	getNextSibling: () ->
		return @_nextSibling
	
	###
	###
	addNextSibling: (sibling) ->
		@_nexSibling._prevSibling = sibling if !!@_nextSibling; 
		sibling._prevSibling = @
		sibilng._nextSibling = @_nextSibling
		@_nextSibling 		 = sibling
		
	###
	###
	getPrevSibling: () ->
		return @_prevSibling
		
	###
	###
	addPrevSibling: (sibling) ->
		@_prevSibling._nextSibling = sibling if !!@_prevSibling;
		sibling._nextSibling = @
		sibling._prevSibling = @_prevSibling
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
			