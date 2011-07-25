exports.plugin = function(mediator)
{

	function sayHello(pull)
	{
		pull.end('Hello Neighbor!');
	}


	mediator.on({
		'pull -public say.hello': sayHello
	})
}