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
                

### Syntax      

The basic route consists of a few parts. The `type` of route, and the `channel`. Here are some examples:

	router.on('pull hello/:name', ...);
	
and

	router.on('push hello/:name', ...);           
	
	
#### Some differences between push, and pull:

##### Push:
  
	
        
`push` is used to define routes which you *push* data to, whereas `pull` is used where you are *requesting* data. A good use-case for pull might be a http request to a particular route. Whereas a `push` might be used for broadcasting a message. Using *both* push, & pull allow you to **bind** to a particular route. For example:

	


### Pseudocode Example

```javascript

var router = require('beanpole').router();
	

router.on({

	/**
	 */

	'push init': function()
	{               
		//GET the query
		router.pull('some/heavy/query', { meta: { GET: 1 } }, function(response)
		{
			
		});     
	},

	/**
	 */

	'pull cache/:ms': function(request)
	{                                
		//check if some/heaby/query is cached 
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

	'pull -method=GET cache/5000 -> some/heavy/query': function(request)
	{                   
		request.end("Hello " + request.data.name + "!");
	}
});


router.push('init');

```
