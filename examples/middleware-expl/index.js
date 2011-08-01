var beanpole = require('../../lib/node').router(),
express = require('express'),
Url = require('url');

beanpole.require('middleware.core');

beanpole.on({

	/**
	 */

	'pull session -> test/session': function()
	{
		return "TESTED!"
	},


	/**
	 */

	'push init': function(init)
	{
		var srv = express.createServer(),
		channels = beanpole.channels();


		function initPath(path, expr)
		{
			srv.get('/' + path, function(req, res)
			{
				beanpole.pull(Url.parse(req.url).pathname, null, { meta: { stream: 1 }, req: req }, function(writer)
				{
					writer.pipe(res);
				})
			});
		}

		for(var channel in channels)
		{
			var expr = channels[channel];

			if(expr.type == 'pull')
			{
				initPath(channel, expr);
			}
		}

		srv.listen(8032);
	}


});


beanpole.push('init');