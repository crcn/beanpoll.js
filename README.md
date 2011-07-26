Beanpole - Super scale your node.js apps 
==========================================

Beanpole distributes your application into "beans" (modules) which can run in-app, in the browser, or on another server. Think of it like building an application with plugins across platforms.

What are some benefits?
----------------------

- Makes your code more asyncronous, and keeps beans decoupled. 
- beans are completely bindable, even ones across networks. If one pod is to make a particular "pull", say "get/file", that same pod can easily bind to it, so it receives any "push" to "get/file" if anything changes.
- Communication between beans in-app, and across multiple platforms is universal. Beanpole does *not* care if a push / pull request comes from within the app, or from a different platform. Heck, you could even create a pod which makes your app visible via an HTTP api, or WebSockets. 

What are some features?
-----------------------
	
- Fully fledged routing framework with syntactic sugar (see below for examples). 
- Chunking messages. This allows you to easily send / receive large amounts of data.
- "push" changes, or "pull" current data. Similar to publish / subscribe.


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


Other Examples
--------------

See examples



To Do
-----

- errors need to be handleable
- round-robin for hooks with same pull handles registered to glue.core
- need putBackToken method for parser
- middleware for router for metadata. e.g: load balancer: round-robin, leastconn, et.c