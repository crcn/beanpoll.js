exports.plugin = function(mediator)
{
	
	function groupHello1(pull)
	{
		pull.end("hello!")
	}

	function groupHello2(pull)
	{
		pull.end("hello again!");
	}

	function groupHello3(pull)
	{
		pull.end("hello for a third time!");
	}


	function init()
	{
		//hello!
		//hello again!
		//hello for a third time!
		mediator.pull('-multi say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello!
		//hello again!
		mediator.pull('-multi -name=group1 say/hello', function(msg)
		{
			console.log(msg)
		});

		//hello for a third time!
		mediator.pull('-multi -name=group2 say/hello', function(msg)
		{
			console.log(msg)
		});
	}
	
	mediator.on({
		'push init': init,
		'pull -name=group2 -multi -o3 say/hello': groupHello3,
		'pull -name=group1 -multi -o2 say/hello': groupHello2,
		'pull -name=group1 -multi -o1 say/hello': groupHello1
	});
}

