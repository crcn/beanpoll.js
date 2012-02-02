var router = require('../').router(), name = 'craig';

router.on({

	
	'pull -one name': function(req, res) {
		res.write("PULL")
		res.end(name);
	},

	'push -one -pull name': function(name) {
		console.log("PUSH")
		console.log(name);
	}
});


router.request('name').
error(function(err) {
	console.log(err.message)
}).
success(function() {
	console.log("you shouldn't see this message")
})