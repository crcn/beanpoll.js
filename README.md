Beanpole - Routing on Steroids 
==============================

Beanpole is a universal routing framework on steriods. Use it for HTTP, WebSockets, or go ahead and use it to distrubte your application across platforms. 

Beanpole is *not* a server
--------------------------

Don't get the wrong idea. Beanpole's more like an evolved EventEmitter. Think of it that way... Now get that idea out of your head >.>.

What are some features?
-----------------------
	
- Fully fledged routing framework with syntactic sugar (see below for examples). 
- Messages are streamed, so you can send large files back and forth.
- Data-bind to any channel via push / pull.
- Distribution built in, helping you create decoupled, scalable applications.
- Use it to augment pre-existing frameworks, such as [express](https://github.com/visionmedia/express)!
- Asyncronous, or Synchronous. Pick your flavor.


Code Usage
----------

TODO

Example
-------

Lot's of them in are in the [examples directory](https://github.com/spiceapps/beanpole/tree/master/examples), but here's a quick one which scratches the surface:

```javascript

var beanpole = require('../../lib/node').router();
	
function delay(pull)
{
	setTimeout(function()
	{
		pull.next();
	}, pull.data.seconds * 1000);
}

function sayHi(data)
{
	console.log('I.');
}

function sayHi2(data)
{
	console.log('Love.');
}

function sayHi3(data)
{
	console.log('Coffee.');
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

```


To Do
-----

- errors need to be handleable.
- need to implement response in Request. Allow for http headers to be handleable. 
- bridge.js needs to also cache errors, and responses. 
- params in ops so they can fill in URI params vs string concatenation (yuck)
- need to implement beanpole.router().require(...) vs benapole.require(...);