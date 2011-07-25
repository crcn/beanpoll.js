var lazy = require('sk/core/lazy').callback;


exports.pod = function(mediator)
{
	var myName;
	
	function pushSayHello(guestName, push)
	{
		console.log('hello %s!', guestName);

		if(push)
		{
			push.from.push('say/hello/back', myName);
		}
	}

	function pushSayHelloBack(guestName, push)
	{
		console.log('%s said hello back!', guestName);
	}
		
	function pushGlueConnection(data, push)
	{
		console.success('A person decided to join the partayyy.');
		push.from.push('say/hello', myName)
	}
	
	function init(n)
	{
		myName = n;
		pushSayHello(n);
	}
	
	mediator.on({
		'push init': init,
		'push glue/connection': pushGlueConnection,
		'push say/hello': pushSayHello,
		'push say/hello/back': pushSayHelloBack,
	})
}