var beanpole = require('../../lib/node').router(),
	Parser = require('../../lib/core/proxy/router/parser');
	


function hello()
{
	return "hello!.";
}

function init()
{
	var start = new Date();

	for(var i = 10000; i--;)
	{
		beanpole.pull('hello/world/my/name/is/craig', function (res)
		{
			// console.log(res)
		});
	}

	console.log(new Date().getTime() - start.getTime());
}

beanpole.on({
	'push init': init,
	'pull hello/world/my/name/is/craig': hello
})


beanpole.push('init');