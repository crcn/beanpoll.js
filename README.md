## Beanpole - Routing framework      


### Motivation

- Abstract communication between parts of an application
	- keeps code modular
	- works in-app, or with other protocols: amqp, http, etc.

This:

```javascript

router.on({
	
	/**
	 */

	'pull auth/user': function(req, res) {
		//auth here
	},

	/**
	 */

	'pull auth/user -> add/photos': function(req, res) {
		//add photos here
	}
})
```


Versus somethine like this:

```javascript


var addPhotos = function(req, res) {
	authUser(req, res, function() {
		//do stuff here
	});
}

```



### Projects using Beanpole

- [celeri](https://github.com/crcn/celeri) - CLI library
- [bonsai](https://github.com/crcn/bonsai) - application server
- [leche](https://github.com/crcn/leche) - Framework to build frontend / backend applications with the same code.
- [daisy](https://github.com/crcn/daisy) - Expose beanpole to: http, websockets, amqp (rabbitmq), etc.    
- [beandocs](https://github.com/crcn/beandocs) - Generate documentation from your beanpole route comments.
- [beanprep](https://github.com/crcn/beanprep) - Scans beans in a given directory, and installs their dependencies. 
- [cupboard](https://github.com/crcn/beanprep) - Reverse package manager.       

### Beanpole ports

- [Actionscript](https://github.com/crcn/beanpole.as)  
- [C++](https://github.com/crcn/beanpoll)     

### Overview          


![Alt ebnf diagram](http://i.imgur.com/v1wdO.png)
                

The basic route consists of a few parts: the `type` of route, and the `channel`. Here are some examples:

	router.on('pull hello/:name', ...);
	
and

	router.on('push hello/:name', ...);           
	

#### Push Routes:  

- Used to broadcast a message, or change (1 to many).
- Doesn't expect a response.    
- Multiple listeners per route.         

#### Pull Routes:

- Used to request data from a particular route (1 to 1).
- Expects a response.
- One listener per route. 
- examples:
	- request to http-exposed route       
	
#### Collect Routes:

- Used to request data from many listeners (1 to many, similar to pull).
- Expects a response.


## Custom Routes

You can easily create custom route handlers. For example:

```javascript
var router = beanpoll.router();

router.use(function() {
	

	return {
		
		/**
		 */

		message: {
			
		}
	}
});
<<<<<<< HEAD
=======
       
````      
           
Middleware can also be specified without using the token: `->`.An example:


````javascript
    
router.on({               
	
	/**
	 */
	
	'pull my/*': function()
	{
		//authorize user
	},  
	
	/**
	 */
	
	'pull my/profile': function()
	{                 
		//goes through authorization first 
	}
});

````                                                                         
                                                                                                
Providing a wildcard `*` tells the router that **anything** after the route must go through it.     

### Managing very long routes

You may run into a route which looks like this:

```javascript
router.on({
	'pull -public -method=POST remove/cache/subscribers -> profile/validate/SAVE_ARTICLE -> groups/:group/subscribers OR groups/:group/subscribers/add': function() {
	
});
```

To fix the ugliness, breakup the route and escape any linebreaks:

```javascript
router.on({
	'pull \
	-public -method=POST \
	remove/cache/subscribers -> \
	profile/validate/SAVE_ARTICLE -> \
	groups/:group/subscribers OR \
	groups/:group/subscribers/add': function() {
		
	}
})
```


### Methods            

#### router.on(type[,listener])

Listens to the given routes

- `type` - string or object. String would contain the route. Object would contain multiple routes / listeners
- `listener` - function listening to the route given.                                                                                  


#### router.push(route[, data][, options])

- `type` - the channel broadcast a message to.
- `data` - the data to push to the given route
- `options` - options for the given route
	- `meta` - tags to use to filter out listeners
	
#### router.pull(route[, data][, options][, callback])

same as push, but expects a response

#### router.channels()

returns all registered channels

#### router.getRoute(route)
                      
returns route expression

#### request.write(chunk)
             
Initializes a streamed response. Great for sending files

#### request.end([chunk]) 
                        
Ends a response 

#### request.hasNext()
                                                     
Returns TRUE if there's a listener after the current one.

#### request.next()

Moves onto the next route.

#### request.forward(channel, callback)

Forwards the current request to the given channel

#### request.thru(channel[ ,options])
       
Treats the given channel as middleware   

#### request.data

Data is added here  


### One last goodie

Beanpole works well with coffeescript:


````coffeescript

router.on                        
                   
	#
	'pull -method=GET say/hello': ->
		"hello world!"           

````

>>>>>>> master

```






                                                                                                              

