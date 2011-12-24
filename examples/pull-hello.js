var beanpoll = require("../"),
router = beanpoll.router();


router.on({
	
	/**
	 */
	
	'pull timeout -> hello/world': function(req, res) {

		req.dump({
			
			data: function(data) {
				console.log(data);
			},

			end: function(data) {
				console.log('END');
			}
		})
	},

	/**
	 */

	'pull timout': function(req) {
		console.log("TIMOUT")
		req.next();
	}

	/**
	 */

	'pull timout -> timeout': function(req) {
		console.log("TIMEOUT")
		
		setTimeout(function() {
			console.log("NEXT");
			req.next();
		}, 100)
	},

	/**
	 */

	'push hello/world': function(err, msg) {
		console.log(msg)
	}
});




var msg = router.pull('hello/world', function() {
	console.log("RESPONSE")
});

msg.write('data');
msg.end('flag')

console.log("PULL")

