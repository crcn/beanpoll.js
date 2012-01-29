var router = require('../').router();

router.on({
	

	'push login OR login/:user/:pass': function(name) {
		console.log(name);
	},

	'push login -> auth': function() {
		
	}
});

router.request('login/craig/condon').type('push').push('test')