exports.pod = function(mediator)
{
	
	function init()
	{
		mediator.pull('-stream loadSite', 'http://engadget.com', function(reader)
		{
			reader.on()
		})
	}
	
	mediator.on({
		'push init': init
	});
	
}