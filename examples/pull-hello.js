var beanpoll = require("../"),
router = beanpoll.router();


router.on({
	
	/**
	 */
	
	'pull hello/world': function(req, res) {
		
		res.end("cheese!");
	},

	/**
	 */

	'push hello/world': function(msg) {
		// console.log("msg")
	}
});


var start = Date.now();


for(var i = 5000; i--;)

/*router.pull("hello/world", null,  function(err, response) {
	
});*/

router.push("hello/world", "google");

console.log(Date.now()-start)

