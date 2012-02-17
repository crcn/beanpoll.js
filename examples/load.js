var beanpoll = require("../"),
router = beanpoll.router();



router.on('pull load', function() {
	console.log("LOAD")
});

router.on('pull load/*', function() {
	console.log("LOAD2")
	this.next();
});

router.on('pull load/*', function() {
	console.log("LOAD3")
	this.next();
});

router.on('pull load/*', function() {
	console.log("LOAD4")
	this.next();
});

router.pull('load')