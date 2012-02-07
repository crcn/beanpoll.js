var router = require('../').router(), name = 'craig';

router.on({

	
	'collect name': function(req, res) {
		res.write("BLAH")
		res.end(name);
	},

	'push -collect name': function(name) {
		console.log(name);
	}
});


var i = 0, oldRoutes;

setInterval(function() {
	
	for(var j = 50; j--;) {	


		router.on({
			'push -collect name': function() {
			},
			'collect name': function() {
				
			},
			'pull -collect name': function() {
				
			}
		}).dispose();


		router.push('name', i++);
	}
}, 10)