var beanpoll = require("../"),
router = beanpoll.router();



router.on({
	

	/**
	 */

	"pull -method=POST OR -method=GET hello/world": function(req, res) {
		res.end("POST");
	},


	/**
	 */

	"pull -method=PUT hello/world": function(req, res) {
		res.end("PUT");
	},

	/**
	 */

	"pull -method=DELETE OR -method=PUT /**": function(req, res, mw) {
		console.log("GREEDY MIDDLEWARE")
		mw.next();
	},

	/**
	 */

	"pull -method=DELETE hello/world": function(req, res) {
		res.end("DEL");
	}
});


router.req("hello/world").
tag({ method: 'DELETE' }).
pull(function(err, response) {
	console.log(response)
});

router.req("hello/world").
tag({ method: 'PUT' }).
pull(function(err, response) {
	console.log(response)
});

router.req("hello/world").
tag({ method: 'POST' }).
pull(function(err, response) {
	console.log(response)
});