var beanpole = require('../../lib/node'),
	argv = process.argv.concat();

beanpole.require(['hook.http','hook.core']);

beanpole.on({

	'pull -public thru/hook2/again': function()
	{
		console.log("through hook 2 (again). Working  a little faster.... ");
		setTimeout(function(self){
			console.log("done!")
			if(!self.next()) self.end('done!');
		}, 500, this);
	},

	'pull -public thru/hook2': function()
	{
		console.log("through hook 2. Pretending to do stuff...");
		
		setTimeout(function(self){
			console.log("done!")
			if(!self.next()) self.end('done!');
		}, 1000, this);
	},

	'push -public hook1/ready': function()
	{
		console.log("connected to hook 1");
	}
});


beanpole.push('init');
beanpole.push('ready','hook2');


console.log('hook2 is ready');

