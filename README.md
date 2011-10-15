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

The basic route consists of a few parts: the `type` of route, and the `channel`. Here are some examples:

	router.on('pull hello/:name', ...);
	
and

	router.on('push hello/:name', ...);           
	
	
#### Some differences between push, and pull:
         

##### Push:  

- Used to broadcast a message, or change (1 to many).
- Doesn't expect a response.    
- Multiple listeners per route.         

##### Pull:

- Used to request data from a particular route (1 to 1).
- Expects a response
- One listener per route.  
- examples:
	- request to http-exposed route       
	
	
	                                                   
Using both push, and pull allow you to **bind** to a particular route. For example:


````javascript
	    
	var _numUsers = 0; 
	
	function numUsers(value)
	{
		if(!arguments.length) return _numUsers;
		
		_numUsers = value;
		                     
		router.push('users/online', value);
	}
	
	
	router.on('pull users/online', function(request)
	{
		request.end(numUsers());
	});                                                    
	          
	//pull num users initially, then listen for when num users changes
	router.on('push -pull users/online', function(request)
	{         
		//handle change here..
		console.log(request.data); //0, 3, 10...
	});                                        
	                               
	           
	
	//triggers above listener
	numUsers(3);
	numUsers(10);

````
                                                                                                              

	


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
