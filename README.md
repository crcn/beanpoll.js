Beanpole - Build modular, realtime, and distributed applications through routing
================================================================================

What are some features?
-----------------------
	
- Syntactic sugar (see below). 
- Messages are streamed, so you can send chunked data back and forth.
- Data-bind to any channel via push / pull.
- Built for distribution. Easily create decoupled, and scalable applications.
- Use it to augment pre-existing frameworks, such as [express](https://github.com/visionmedia/express).
- Handle responses asyncronously (via streams), or syncronously. Pick your flavor.
- Intercept push / pulls based on data (see examples).



Example
-------

```javascript

var beanpole = require('../../lib/node').router();
	
function delay()
{
	setTimeout(function (self){ self.next(); }, this.data.seconds * 1000, this);
}

function sayHi()
{
	return "I.";
}

function sayHi2()
{
	return "Love.";
}

function sayHi3()
{
	return "Coffee.";
}

function init()
{
	for(var i = 3; i--;)
	{
		beanpole.pull('say/hi', function (message)
		{

			//output:
			//I.
			//Love.
			//Coffee.
			console.log(message)
		});	
	}
}

beanpole.on({
	'push init': init,
	'pull delay/:seconds': delay,
	'pull -rotate delay/1 -> say/hi': sayHi,
	'pull -rotate delay/2 -> say/hi': sayHi2,
	'pull -rotate delay/3 -> say/hi': sayHi3
});


beanpole.push('init');

```
