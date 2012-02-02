var vows = require('vows'),
assert = require('assert'),
beanpoll = require('../')


vows.describe('beanpoll/pull').addBatch({
	
	'A router with pull requests': {
		topic: function() {

			var router = beanpoll.router(),
			name = 'craig';

			router.on({
				
				'pull name': function(req, res, mw) {
					
					res.end('craig');
				},

				'pull flatten/:data': function(req, res, mw) {
					
				}
			})
		},

		'when listening to a pull ': function(router) {
			
			router.on({
				'pull test': function() {
					console.log("G")
				}
			})
		}
	}

}).export(module);