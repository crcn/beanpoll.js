Beanpole - Routing on Steroids 
==============================

Beanpole is a universal routing framework on steriods. Use it for HTTP, WebSockets, or go ahead and use it to distrubte your application across platforms.

Beanpole is *not* a server
--------------------------

Don't get the wrong idea. Beanpole's more like an evolved EventEmitter. Think of it that way... Now get that idea out of your head >.>.

What are some features?
-----------------------
	
- Syntactic sugar (see below for examples). 
- Messages are streamed, so you can send large files back and forth.
- Data-bind to any channel via push / pull.
- Distribution built in, helping you create decoupled, scalable applications.
- Use it to augment pre-existing frameworks, such as [express](https://github.com/visionmedia/express)!
- Asyncronous, or Synchronous. Pick your flavor.
- Intercept push / pulls based on data (seee examples).


Code Usage
----------

TODO

Example
-------

Lot's of them in are in the [examples directory](https://github.com/spiceapps/beanpole/tree/master/examples), but here's a that scratches the surface:

```javascript

var beanpole = require('../../lib/node').router();
	
function delay(pull)
{
	setTimeout(function()
	{
		pull.next();
	}, pull.data.seconds * 1000);
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

		//output:
		//I.
		//Love.
		//Coffee.
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

- intercept data based on other parameters ~ responses, ip addresses, etc.
- errors need to be handleable.
- ability to set the same metadata twice for different values?
- need to implement response in Request. Allow for http headers to be handleable. 
- bridge.js needs to also cache errors, and responses. 
- params in ops so they can fill in URI params vs string concatenation (yuck)
- need to implement beanpole.router().require(...) vs benapole.require(...);
- push -store? (pushing data, and allowing subscribers to pull it - use mongodb maybe)
	- pull search in data parameter?
- need to have data parameter for on('push -pull');
- need to have middleware for certain types of metadata (rotate, store, ...). Use beans? Placement = where rotate logic currently is.
