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