var beanpole = require('../../lib/node').router();
	


function sayHi()
{

	// this.next();
	return "don't pass " + this.data.name+ " "+this.data.last;
}

function sayHi2()
{
	console.log('pass!')

	if(!this.next())
	{
		this.end("GO")
	}
}

function sayHiCraig()
{
	if(!this.next()) return "GO"
}

function sayHi3()
{
	if(!this.next()) return "hello";
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
	'pull hello/:name/:last': sayHi,
	'pull hello/craig/condon -> hello/test': sayHiCraig,
	'pull hello/test -> hello2': sayHi3
});

// console.log(beanpole.routeMiddleware._routers.pull._collection._routes)

beanpole.push('init');