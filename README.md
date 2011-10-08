Beanpole - Build modular, realtime, and distributed applications through routing
================================================================================

### What are some features?
	
- Syntactic sugar (see below). 
- Messages are streamed, so you can send chunked data back and forth.
- Data-bind to any channel via push / pull.
- Built for distribution. Easily create decoupled, and scalable applications.
- Use it to augment pre-existing frameworks, such as [express](https://github.com/visionmedia/express).
- Handle responses asyncronously (via streams), or syncronously. Pick your flavor.
- Intercept push / pulls based on data (see examples).


### Projects using Beanpole

- [celeri](https://github.com/spiceapps/celeri) - CLI library for node.js
- [bonsai](https://github.com/spiceapps/bonsai) - application server for node.js
- [leche](https://github.com/spiceapps/leche) - Framework to build frontend / backend applications with the same code.
- [daisy](https://github.com/spiceapps/daisy) - Beanpole + rabbitmq.



### Example

```javascript

var beanpole = require('../../lib/node').router();
	

beanpole.on({

	/**
	 */

	'push init': function()
	{
		for(var i = 3; i--;)
		{
			this.router.pull('say/hi', function (message)
			{

				//output:
				//I.
				//Love.
				//Coffee.
				console.log(message)
			});	
		}	
	},

	/**
	 */

	'pull delay/:seconds': function()
	{
		setTimeout(function (self){ self.next(); }, this.data.seconds * 1000, this);
	},

	/**
	 */

	'pull -rotate delay/1 -> say/hi': function()
	{
		return "I.";
	},

	/**
	 */

	'pull -rotate delay/2 -> say/hi': function()
	{
		return "Love.";
	}

	/**
	 */

	'pull -rotate delay/3 -> say/hi': function()
	{
		return "Coffee.";
	}
});


beanpole.push('init');

```
