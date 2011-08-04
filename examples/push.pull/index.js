var beanpole = require('../../lib/node').router();
	


beanpole.on({
	'pull name': function()
	{
		setTimeout(function()
		{
			beanpole.push('name', 'PUSH');
			beanpole.push('name', 'PUSH');
			beanpole.push('name', 'PUSH');
		}, 100);

		return 'PULL';
	},
	'push -pull name': function(name)
	{
		console.log(name)
	}
});