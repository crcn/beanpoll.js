var connectHttpTransport = require('./http');
	
	
exports.pod = function(mediator, host)
{
	function getTransport(writer)
	{
		writer.end(connectHttpTransport);
	}
	
	mediator.on({
		'pull glue/transport': getTransport
	})
}