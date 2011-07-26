exports.plugin = function(mediator)
{
	
	function sayHello1(pull)
	{
		pull.end("hello!")
	}

	function sayHello2(pull)
	{
		pull.end("hello again!");
	}

	function sayHello3(pull)
	{
		pull.end("hello for a third time!");
	}


	function init()
	{
		setInterval(function()
		{
			mediator.pull('say/hello', function(msg)
			{
				console.log(msg)
			});

		}, 400);
	}
	
	mediator.on({
		'push init': init,
		'pull -lb=3 say/hello': sayHello3,
		'pull -lb=2 say/hello': sayHello2,
		'pull -lb=1 say/hello': sayHello1,
	});
	
}