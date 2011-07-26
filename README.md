Beanpole - Routing on Steroids 
==============================

Beanpole is a universal routing framework on steriods. Use it for HTTP, WebSockets, or go ahead and use it to distrubte your application across platforms. 

What are some features?
-----------------------
	
- Fully fledged routing framework with syntactic sugar (see below for examples). 
- Messages are streamed, so you can send large files back and forth.
- Data-bind to any channel via push / pull.
- Distribution built in, helping you create decoupled, scalable applications.
- Asyncronous


Code Usage
----------

index.js:

```javascript

require('brazilnut').
require(__dirname + '/beans/my.test.pod').
require(__dirname + '/beans/my.test.pod2').
push('init');

```

in beans/my.test.pod/index.js:


```javascript

exports.plugin = function(mediator)
{
	
	function init()
	{
		mediator.pull('say/hello', function(name)
		{
			console.log(name);//hello!
		})
	}
	
	mediator.on({
		'push init': init
	})
}

```

in beans/my.test.pod2/index.js:


```javascript

exports.plugin = function(mediator)
{
	
	function pullSayHello(pull)
	{
		pull.end('hello world!')
	}
	
	mediator.on({
		'pull say/hello': pullSayHello
	})
}

```


Streaming
---------

```javascript

exports.plugin = function(mediator)
{
	
	function init()
	{
		mediator.pull('-stream final/countdown/10', function(reader)
		{
			reader.on({
				write: function(chunk)
				{
					//T minus: 10
					//T minus: 9
					//T minus: 8
					//T minus: 7
					//...
					//WE HAVE LIFTOFF!
					console.log(chunk);
				},
				end: function()
				{
					console.log("BOOOOSSHHHHH!")
				}
			})
		})
	}
	
	mediator.on({
		'push init': init
	})
}

```

in beans/my.test.pod2/index.js:


```javascript

exports.plugin = function(mediator)
{
	
	function pullCountdown(pull)
	{
		var tminus = pull.data.time;

		var interval = setTimeout(function()
		{
			if(!(--tminus))
			{
				pull.end("WE HAVE LIFTOFF!");	
			}

			pull.write('T minus: '+tminus);
		},1000);
	}
	
	mediator.on({
		'pull final/countdown/:time': pullCountdown
	});
}

```


Passing through other routes
----------------------------

```javascript

exports.plugin = function(mediator)
{
	
	function init()
	{

		//Delayed for 2 seconds
		//Delayed for 1 seconds
		//hello craig
		mediator.pull('say/hello', { name: craig }, function(data)
		{
			console.log(data)
		})
	}

	function pullDelay(pull)
	{
		console.log("Delayed for %d seconds", pull.data.time);
		setTimeout(function()
		{

			//if there's nothing next, then we're calling delay directly
			if(!pull.next())
			{
				pull.end('done delaying!');
			}
		}, pull.data.time * 1000);
	}

	function sayHello(pull)
	{
		pull.end('hello ' + pull.data.name);
	}
	
	mediator.on({
		'pull delay/:time': pullDelay,
		'pull delay/3 -> delay/2 -> delay/1 -> say/hello': sayHello 
		'push init': init
	})
}

```

Auto-pass through other routes
------------------------------

```javascript

exports.plugin = function(mediator)
{
	
	function init()
	{
		mediator.pull('my/secret', { user: 'craig', pass: 'jefferds' }, function(data)
		{
			//You shall not pass!
			console.log(data);
		})
	}

	function authenticate(pull)
	{
		if(pull.data.user != 'craig' || pull.data.pass != 'secret')
		{
			return pull.end('You shall not pass!');
		}

		if(!pull.next())
		{
			pull.end('You have been authenticated');
		}
	}

	function showSecret(pull)
	{
		pull.end("You don't have any secrets")
	}
	
	mediator.on({
		'pull my/*': authenticate,
		'pull my/secret': showSecret 
		'push init': init
	})
}

```


Oh look, a HTTP server example
--------------------------------

index.js:

```javascript

require('beanpole').
require('glue.core').
require(__dirname + '/beans').
push('init');

bean one:

```javascript


exports.plugin = function(mediator)
{
	
	function init()
	{
		

	}

	function delay(pull)
	{
		console.log('delaying for %d seconds', pull.data.seconds);

		setTimeout(function()
		{
			if(!pull.next())
			{
				pull.end('Done!');
			}
		}, pull.data.seconds * 1000);
	}

	function sayHello(pull)
	{
		pull.end('hello '+pull.data.name+'!');
	}
	
	mediator.on({
		'push init': init,
		'pull -public delay/:seconds': delay,
		'pull -public delay/:delay -> say/hello/:delay/:name': sayHello
	});
	
}

```

bean two:

```javascript 

var express = require('express');

exports.plugin = function(mediator)
{

	function init(pull)
	{
		var srv = express.createServer();

		mediator.pull('glue', function(data)
		{
			data.channels.forEach(function(channel)
			{
				srv.get('/'+channel.name, function(req, res)
				{
					var name = channel.name;

					for(var param in req.params)
					{
						name = name.replace(':'+param,req.params[param])	
					}

					mediator.pull('-stream ' + name, function(writer)
					{
						writer.pipe(res);
					})
				});
			});

			srv.listen(8032);
		});

	}

	console.log('Server running on port ' + 8032+'. try http://localhost:8032/say/hello/craig');
	

	mediator.on({
		'push init': init
	});	
}

```


Other Examples
--------------

See examples



To Do
-----

- errors need to be handleable.
- need putBackToken method for parser.
- need to implement response in Request. Allow for http headers to be handleable. 
- bridge.js needs to also cache errors, and responses. 