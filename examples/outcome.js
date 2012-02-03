var beanpoll = require("../"),
router = beanpoll.router();


function auth(credits, callback) {


	if(credits.user != 'user' || credits.pass != 'pass') {
		return callback(new Error('invalid credits'));
	}

	callback(false, { user: 'user', pass: 'pass' });
}


router.on({
	
	'pull authenticate': function(req, res) {
		

		//don't bother handling errors - 
		auth(req.query, res.success(function(user) {
			
			res.end(user);

		}));
	}
})



//success
var req = router.request('authenticate').
error(function(err) {
	console.log(err.stack);
}).
success(function(response) {
	console.log(response);
}).
query({ user: 'user', pass: 'pass' });

req.pull();

//error
req.query({ user: 'user', pass: 'bad pass' }).pull();

