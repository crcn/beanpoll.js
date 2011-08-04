var beanpole = require('../../lib/node').router();

function all()
{
	// console.log('all');

	if(!this.next())
	{
		return "ROTATE THRU"
	}
}

function all2()
{
	return "ROTATE"
}

function thru()
{
	console.log('thru');

	if(!this.next())
	{
		return "THRU"
	}
}

function thru2()
{
	if(!this.next())
	{
		this.end('END!')
	}
}

function sayHi(message)
{
	this.end('world!');
}

beanpole.on({
	'pull /*': all,
	'pull  hello': sayHi
	// 'pull -d hello': sayHi
});





/*setInterval(function()
{
	
var start = new Date().getTime();
for(var i = 10000; i--;)
beanpole.pull('hello','world!', function(writer)
{
	writer.on({
		'write': function(chunk)
		{
			// console.log(chunk);
		}
	})
});
console.log(new Date().getTime() - start);
},1)*/
