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

```






                                                                                                              

