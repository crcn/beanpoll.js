var beanpoll = require("../"),
router = beanpoll.router();


router.on({

	/**
	 */

	'pull -userid=param auth/:userid': function(req, res, mw) {
		mw.next()
	},
	
	/**
	 */
	
	'pull timeout -> timout -> timout -> timeout -> hello/:name': function(req, res) {

		console.log("DUMP")
		req.dump({
			
			data: function(data) {
				console.log(data);
			},

			end: function() {
				res.end("RESPONSE");
			}
		})
	},

	/**
	 */

	'pull timout': function(req, res, mw) {
		console.log("TIMOUT")
		mw.next();
	},

	/**
	 */

	'pull timout -> timeout': function(req, res, mw) {
		console.log("TIMEOUT")
		
		setTimeout(function() {
			console.log("NEXT");
			mw.next();
		}, 100)
	},

	/**
	 */

	'push hello/world': function(err, msg) {
		// console.log(msg)
	}
});


var start = Date.now();



router.request('hello/world').pull(function(err, result) {
	console.log(result);
});


router.request('does/not/exist').error(function(err) {
	console.log(err);
}).
success(function(result) {
}).pull().end('Finish')


