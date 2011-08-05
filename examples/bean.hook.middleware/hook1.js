var beanpole = require('../../lib/node'),
	argv = process.argv.concat();

beanpole.require(['hook.http','hook.core']);

beanpole.on({
	'pull -public thru/hook2 -> thru/hook2/again -> account': function()
	{
		console.log("fetching account...");

		return "some user account details";
	},
	'push -public hook2/ready': function()
	{
		console.log("connected to hook 2");

		beanpole.pull('account', function(message)
		{
			console.ok("Much success! Here's the message:  ");
			console.success(message);
		})
	}
});

beanpole.push('init');
beanpole.push('ready','hook1');


console.log('hook1 is ready');