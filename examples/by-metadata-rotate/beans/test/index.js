exports.plugin = function(mediator)
{
	
	function hello1(pull)
	{
		pull.end("hello 1!")
	}

	function hello2(pull)
	{
		pull.end("hello 2!");
	}

	function hello3(pull)
	{
		pull.end("hello 3!");
	}


	function init()
	{
		//hello 3!
		mediator.pull('say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello 1!
		mediator.pull('say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello 2!
		mediator.pull('say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello 2!
		mediator.pull('-name=group1 say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello 3!
		mediator.pull('-name=group1 say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello 1!
		mediator.pull('-name=group2 say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello 1!
		mediator.pull('-name=group2 say/hello', function(msg)
		{
			console.log(msg)
		});
	}
	
	mediator.on({
		'push init': init,

		//NOTE: rotate=N is provided just so the properties aren't overridden
		'pull -name=group2 -rotate=3 say/hello': hello1,
		'pull -name=group1 -rotate=2 say/hello': hello2,
		'pull -name=group1 -rotate=1 say/hello': hello3
	});
}

