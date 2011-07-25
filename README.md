Brazil Nut - Super scale your node.js apps 
==========================================

Brazil Nut distributes your application into "pods" (modules) which can run in-app, in the browser, or on another server. Think of it like building an application with plugins across platforms.

What are some benefits?
----------------------

- Makes your code more asyncronous, and keeps pods decoupled. 
- Pods are completely bindable, even ones across networks. If one pod is to make a particular "pull", say "get/file", that same pod can easily bind to it, so it receives any "push" to "get/file" if anything changes.
- Communication between pods in-app, and across multiple platforms is universal. Brazil Nut does *not* care if a push / pull request comes from within the app, or from a different platform. Heck, you could even create a pod which makes your app visible via an HTTP api, or websockets.

What are some features?
-----------------------
	
- Fully fledged routing framework with sntactic sugar (see below for examples).
- Chunking messages. This allows you to easily send / receive large amounts of data.
- "push" changes, or "pull" current data. Similar to publish / subscribe.


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

Other Examples
--------------

See examples