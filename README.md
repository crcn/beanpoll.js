[![build status](https://secure.travis-ci.org/crcn/beanpoll.js.png)](http://travis-ci.org/crcn/beanpoll.js)
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

## Error Handling


```javascript


function auth(credits, callback) {
	
	if(credits.user != 'user' || credits.pass != 'pass') return callback(new Error('invalid credits'));

	callback(false, { user: 'user', pass: 'pass' });
}


router.on({
	
	'pull authenticate': function(req, res) {
		
		//don't bother handling errors - done by response
		auth(req.query, res.success(function(user) {
			
			res.end(user);

		}));
	}
})



//error
var req = router.request('authenticate').
error(function(err) {
	console.log(err.stack);
}).
success(function(response) {
	console.log(response);
}).
query({ user: 'user', pass: 'bad pass' }).
pull();
```


## Custom Routes

You can easily create custom route handlers. Take [celeri](/crcn/celeri) for example:



```javascript

var beanpoll = require('beanpoll'),
structr = require('structr');

//handles the message, response, and middleware
var CmdMessenger = structr({
	
	_next: function(middleware) {
		
		var self = this;	

		try {

			//call the command handler, and wrap the LAST parameter as a next function
			middleware.listener(Structr.copy(middleware.params, data), function() {
				return self.next();	
			});		

		} catch(e) {
			self.response.error(e)
		}

	}

}, beanpoll.Messenger);


//the "Event Emitter"
var CmdDirector = structr({

	_newMessenger: function(message, middleware) {
		return new CmdMessenger(message, middleware, this);
	}

}, beanpoll.Director);



var router = beanpoll.router();


//use the new plugin
router.use(function() {
	return {
		name: 'console',
		director: new CmdDirector('celeri', router)
	}
});

//use it:
router.on('console say/hello', function(data, next) {
	//do stuff here
});

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

You can also split it up:

```javascript
router.on({
	'pull \
	remove/cache/subscribers -> \
	profile/validate/SAVE_ARTICLE -> \
		validate/group/subscribers': function() {
		
	}
})

router.on({
	'pull \
	-public -method=POST \
	validate/group/subscribers ->
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

#### router.request(router)

returns the request builder         

```javascript

router.request('signup/user').
query({ username: 'blarg' }).
headers({ 'Content-Type': 'application/json' }).

//called when the second param is present. 
success(function(response) {
	
}).

//separated error from the response
error(function(err) {
	
}).

//called when there's a result, or error
response(err, response) { 
	
}).

//type of request: push, pull, collect, your own
push();
```                           

#### router.push(route[, query][, headers])

- `type` - the channel broadcast a message to.
- `data` - the data to push to the given route
- `options` - options for the given route
	- `meta` - tags to use to filter out listeners
	
#### router.pull(route[, query][, headers][, callback])

same as push, but expects a response

#### router.channels()
                      
returns route expression

#### request.write(chunk)
             
Initializes a streamed response. Great for sending files

#### request.end([chunk]) 
                        
Ends a response 

#### request.hasNext()
                                                     
Returns TRUE if there's a listener after the current one.

#### request.next()

Moves onto the next route.









                                                                                                              

