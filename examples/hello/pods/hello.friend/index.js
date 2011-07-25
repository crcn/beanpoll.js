exports.pod = function(mediator)
{

	function sayHello(pull)
	{
		pull.callback('Hello Friend!');
	}
	

	mediator.on({
		'pull public say.hello': sayHello
	});	
}