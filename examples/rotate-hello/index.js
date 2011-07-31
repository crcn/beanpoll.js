var beanpole = require('../../lib/node').router();
	
function delay()
{
	setTimeout(function (self){ self.next(); }, this.data.seconds * 1000, this);
}

function sayHi(pull)
{
	pull.end('I.');
}

function sayHi2(pull)
{
	pull.end('Love.');
}

function sayHi3(pull)
{
	pull.end('Coffee.');
}

function init()
{
	for(var i = 3; i--;)
	{
		beanpole.pull('say/hi', function (res)
		{
			console.log(res)
		});	
	}
}

beanpole.on({
	'push init': init,
	'pull delay/:seconds': delay,
	'pull -rotate delay/1 -> say/hi': sayHi,
	'pull -rotate delay/2 -> say/hi': sayHi2,
	'pull -rotate delay/3 -> say/hi': sayHi3
})


beanpole.push('init');