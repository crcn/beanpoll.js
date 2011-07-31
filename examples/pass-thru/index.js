var beanpole = require('../../lib/node').router();
	
function delay(pull)
{
	setTimeout(function()
	{
		pull.next();
	}, pull.data.seconds * 1000);
}

function sayHi()
{
	if(!this.next())
	{
		this.end("END")
	}
}

function sayHi2()
{
	this.end('hello')
}

function sayHi3()
{
	console.log('Coffee.');
}

function init()
{
	beanpole.pull('hello2', function(result)
	{
		console.log(result)
	});
}

beanpole.on({
	'push init': init,
	'pull hello': sayHi,
	'pull hello -> hello2': sayHi2
})


beanpole.push('init');