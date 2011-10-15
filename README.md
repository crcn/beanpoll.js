## Beanpole - Routing framework      
               

### What are some features?
	
- Syntactic sugar (see below).                                         
- Works with many protocols: amqp, http, websockets, etc.                      
- Hooking with other applications is a breeze with [daisy](https://github.com/spiceapps/daisy).    


### Projects using Beanpole

- [celeri](https://github.com/spiceapps/celeri) - CLI library for node.js
- [bonsai](https://github.com/spiceapps/bonsai) - application server for node.js
- [leche](https://github.com/spiceapps/leche) - Framework to build frontend / backend applications with the same code.
- [daisy](https://github.com/spiceapps/daisy) - Expose beanpole to: http, websockets, amqp (rabbitmq), etc.


### Pseudocode Example

```javascript

var beanpole = require('../../lib/node').router();
	

beanpole.on({

	/**
	 */

	'push init': function()
	{
		router.pull('some/heavy/query/to/cache', function(response)
		{
			
		});	
	},

	/**
	 */

	'pull cache/:ms': function(request)
	{                                
		//check if some/heaby/query/to/cache is cached 
		if(isCached(request.channel))             
		{
			request.end(getCache(request.channel));
		}                                           
		else
		{
			request.next();
		}
	},

	/**
	 */

	'pull -method=GET cache/5000 -> some/heavy/query/to/cache': function(request)
	{                   
		request.end("Hello " + request.data.name + "!");
	}
});


beanpole.push('init');

```
