var connectHttpTransport = require('./http');
	
	
exports.plugin = function(mediator, host)
{
	function getTransport(writer)
	{
		writer.end(connectHttpTransport);
	}
	
	mediator.on({
		'pull -multi hook/transport': getTransport
	})
}