exports.pod = function(mediator)
{
	
	function init()
	{
		console.log('calling plugins to say hello...');
		
		mediator.pull('say.hello', function(response)
		{
			console.log(response);
		});
	}
	
	mediator.on({
		'push init': init
	});
	
}