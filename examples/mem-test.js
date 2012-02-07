var beanpoll = require('../'),
router = beanpoll.router(),
name = 'craig';

router.on({

	
	'collect name': function(req, res) {
		res.write("BLAH")
		res.end(name);
	},

	'push name': function(name) {
		console.log(name);
		this.from.push('name','ret')
	}
});


var i = 0, oldRoutes;

setInterval(function() {
	
	for(var j = 50; j--;) {	

		var rt = beanpoll.router();
		rt.use(router.using());
		rt.name = 'ff'

		rt.on({
			'push -collect name': function(name) {
				console.log(name)
			},
			'collect name': function() {
				
			},
			'pull -collect name': function() {
				
			}
		});


		router.request('name').from(rt).query(i++).push();


	}
}, 10)