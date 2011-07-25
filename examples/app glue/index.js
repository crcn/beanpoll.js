var beanpole = require('../../src/node'),
	argv = process.argv.concat();
	
argv.splice(0,2);

var name = argv[0];

function onName(name)
{
	beanpole.require(['glue.core','glue.http']).
	require(__dirname + '/beans').push('init', name.toString().replace('\n',''));
	
	process.stdin.removeListener('data', onName);
};

if(name)
{
	onName(name)
}
else
{
	process.stdout.write('Name: ');
	process.stdin.on('data', onName);

	process.openStdin();
}
