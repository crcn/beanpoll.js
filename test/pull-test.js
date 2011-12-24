var vows = require('vows'),
assert = require('assert'),
beanpoll = require('../')


vows.describe('Pulling request').addBatch({
	
	'A router': {
		topic: beanpoll.router,

		'when listening to a pull ': function(router) {
			
			router.on({
				'pull test': function() {
					console.log("G")
				}
			})
		}
	}

}).export(module);