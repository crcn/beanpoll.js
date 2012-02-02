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

router.request('name').success(function(data) {
	console.log(data)
}).collect();