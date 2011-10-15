## Beanpole - Routing framework      
               

### What are some features?
	
- Syntactic sugar (see below).                                         
- Works with many protocols: amqp, http, websockets, etc.                      
- Hooking with other applications is a breeze with [daisy](https://github.com/spiceapps/daisy).    


### Projects using Beanpole

- [celeri](https://github.com/spiceapps/celeri) - CLI library for node.js
- [bonsai](https://github.com/spiceapps/bonsai) - application server for node.js
- [leche](https://github.com/spiceapps/leche) - Framework to build frontend / backend applications with the same code.
- [daisy](https://github.com/spiceapps/daisy) - Expose beanpole to http, websockets, 


### Example

```javascript

var beanpole = require('../../lib/node').router();
	

beanpole.on({

	/**
	 */

	'push init': function()
	{
		router.pull('say/hi/craig');	
	},

	/**
	 */

	'pull delay/:seconds': function()
	{
		setTimeout(function (self){ self.next(); }, this.data.seconds * 1000, this);
	},

	/**
	 */

	'pull -method=GET delay/1 -> say/hi/:name': function(request)
	{                   
		request.end("Hello " + request.data.name + "!");
	}
});


beanpole.push('init');

```
