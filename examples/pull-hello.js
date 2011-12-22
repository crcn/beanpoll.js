var beanpoll = require("../"),
router = beanpoll.router();


router.on({
	
	/**
	 */
	
	'pull hello/world': function(req, res) {
		
		res.end("cheese!");
	}
});


var start = Date.now();



for(var i = 5000; i--;)

router.pull("hello/world", null,  function(err, response) {
	
});

console.log(Date.now()-start)
