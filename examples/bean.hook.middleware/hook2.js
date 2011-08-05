var beanpole = require('../../lib/node'),
	argv = process.argv.concat();

beanpole.require(['hook.http','hook.core']);

beanpole.on({
	'pull -public auth': function()
	{
		console.log('authenticating');

		if(!this.next()) return "authenticated"
	},
	'push -public hook1/ready': function()
	{
		console.log("connected to hook 1");
	}
});


beanpole.push('init');
beanpole.push('ready','hook2');


console.log('hook2 is ready');

