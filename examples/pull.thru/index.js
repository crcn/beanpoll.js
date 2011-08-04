var beanpole = require('../../lib/node').router();
	


function sayHi()
{
	return "don't pass " + this.data.name;
}

function sayHi2()
{
	console.log('pass!')

	if(!this.next())
	{
		this.end("GO")
	}
}

function sayHi3()
{
	return "hello";
}


function init()
{
	for(var i = 4; i--;)
	{
		beanpole.pull('hello2', function(result)
		{
			console.log(result)
		});	
	}
	
}

beanpole.on({
	'push init': init,
	'pull -rotate=1 hello/:name': sayHi,
	'pull -rotate=2 hello/:name': sayHi2,
	'pull hello/craig -> hello2': sayHi3
})


beanpole.push('init');