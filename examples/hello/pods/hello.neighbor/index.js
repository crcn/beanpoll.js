exports.pod = function(mediator)
{

	function sayHello(pull)
	{
		pull.callback('Hello Neighbor!');
	}


	mediator.on({
		'pull public say.hello': sayHello
	})
}