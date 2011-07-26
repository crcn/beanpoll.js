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
		'pull -rotate say/hello': sayHello3,
		'pull -rotate say/hello': sayHello2,
		'pull -rotate say/hello': sayHello1,
	});
	
}