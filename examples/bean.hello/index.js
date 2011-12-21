var router = require('../../lib/node').router(),
haba = require('haba')();


haba.options(router, true).
require(__dirname + '/beans').
init(function() {
	router.push('init');
});