var router = require('../').router(), name = 'craig';

router.on({

	
	'collect name': function(req, res) {
		res.end(name);
	},

	'push -collect name': function(name) {
		console.log(name);
	}
});

router.collect('name')