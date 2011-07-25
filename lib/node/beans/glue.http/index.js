var connectHttpTransport = require('./http');
	
	
exports.plugin = function(mediator, host)
{
	function getTransport(writer)
	{
		writer.end(connectHttpTransport);
	}
	
	mediator.on({
		'pull glue/transport': getTransport
	})
}