var beanpoll = require("../"),
router = beanpoll.router();


router.on({

	/**
	 */

	'pull -userid=param auth/:userid': function(req, res) {
		req.next()
	},
	
	/**
	 */
	
	'pull timeout -> timout -> timout -> timeout -> hello/world': function(req, res) {

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
	},

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
		// console.log(msg)
	}
});


var start = Date.now();



// for(var i = 5000; i--;)
// var msg = router.push('hello/world', 'fsdfs');

router.request('hello/world').pull(function(err) {
	
});

console.log(Date.now() - start);
// msg.write('data');
// msg.end('flag')

// console.log("PULL")

