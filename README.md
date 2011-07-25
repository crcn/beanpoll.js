Brazil Nut - Super scale your node.js apps 
==========================================

Brazil nut was built to abstract routing calls, whether it's via HTTP, websockets, or within the application. All communication is handled exactly the same. What does this mean?


	- To Do. it's f'n 2:17 AM. My brain is off.


What are the features?
----------------------
	
	- syntactic sugar
	- push / pull changes

Code Usage
----------

index.js:

```javascript

require('brazilnut').
require(__dirname + '/pods/my.test.pod').
require(__dirname + '/pods/my.test.pod2').
push('init');

```

in pods/my.test.pod/index.js:


```javascript

exports.pod = function(mediator)
{
	
	function init()
	{
		mediator.pull('say/hello', function(name)
		{
			console.log(name)
		})
	}
	
	mediator.on({
		'push init': init
	})
}

```

in pods/my.test.pod2/index.js:


```javascript

exports.pod = function(mediator)
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

Abstracting 
-----------

index.js: same as above

in pods/my.test.pod/index.js:


```javascript

exports.pod = function(mediator)
{
	
	function init()
	{
		mediator.pull('loadSite', { site: 'http://engadget.com' } function(name)
		{
			console.log(name)
		})
	}
	
	mediator.on({
		'push init': init
	})
}

```

in pods/my.test.pod2/index.js:


```javascript

exports.pod = function(mediator)
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


Experimental
------------







	





