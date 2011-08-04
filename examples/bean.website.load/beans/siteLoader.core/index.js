var http = require('http'),
	Url = require('url')

exports.plugin = function(mediator)
{

	function pullLoadSite(pull)
	{
		var parts = Url.parse(pull.data.site);

		// console.log(require('sys').inspect(parts, false, null));
		http.get({ host: parts.host, port: 80, path: parts.pathname }, function(res)
		{
			res.on('data', function(data)
			{
				pull.write(data);
			});

			res.on('end', function(data)
			{
				pull.end();
			})
		});
	}
	

	mediator.on({
		'pull load/site': pullLoadSite
	});	
}