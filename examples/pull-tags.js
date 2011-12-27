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

	"pull -method=DELETE hello/world": function(req, res) {
		res.end("DEL");
	}
});


router.req("hello/world").
tags({ method: 'GET' }).
pull(function(err, response) {
	console.log(response)
});