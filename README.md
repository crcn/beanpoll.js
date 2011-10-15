## Beanpole - Routing framework      
               

### What are some features?
	
- Syntactic sugar (see below).                                         
- Works with many protocols: amqp, http, websockets, etc.                      
- Hooking with other applications is a breeze with [daisy](https://github.com/spiceapps/daisy).    


### Projects using Beanpole

- [celeri](https://github.com/spiceapps/celeri) - CLI library
- [bonsai](https://github.com/spiceapps/bonsai) - application server
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
        

//numUser getter / setter function
function numUsers(value)
{
	if(!arguments.length) return _numUsers;
	
	_numUsers = value;
	                     
	router.push('users/online', value);
}


//the request handler. This could be called in-app. It's also just as easily exposable as an API to http, websockets, etc.
router.on('pull users/online', function(request)
{
	request.end(numUsers());
});                                                    
          
//pull num users initially, then listen for when num users changes.
router.on('push -pull users/online', function(response)
{         
	//handle change here..
	console.log(response); //0, 3, 10...
});                                        
                               
           

//triggers above listener
numUsers(3);
numUsers(10);

````        

Okay, so you might have noticed I added something funky here: `-pull` - that's a tag. Tags are structured like so:

   	router.on('pull -tagName hello/:route', ...);

or, you can add a value to it:

	router.on('pull -method=GET hello/:route', ...);
	
As mentioned above, you can only have one listener per `pull` request. HOWEVER, you can listen to the same route *if* you provide different tag value. For example:

````javascript

router.on({

	/**      
	 * returns the given user
	 */
	
	'pull -method=GET users/:userId': function(request)
	{                           
		//get the specific user  
	},
	
	/**   
	 * updates a user   
	 */
	
	'pull -method=UPDATE users/:userId': function(request)
	{
		//update user here
	},
	
	/** 
	 * deletes a user
	 */
	
	'pull -method=DELETE users/:userId': function(request)
	{
		//delete user 
	}                         
	
}); 
````       

The above chunk of code is well suited for a REST-ful api without explicilty saying it's *for* http. It can be used for any protocol. For example - say I wanted to *delete* a user using the code above:

````javascript

router.pull('users/' + someUserId, { meta: { method: 'DELETE'} }, function()
{
	//delete user response
});  

````                      

You might have guessed - tags can be used to filter routes. Okay, onto something a little more advanced: **middleware**.  

                                                                                                              

