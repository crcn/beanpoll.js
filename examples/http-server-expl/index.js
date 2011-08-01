var beanpole = require('../../lib/node').router(),
express = require('express'),
Url = require('url');


beanpole.on({

	'http -rotate thru': function()
	{
		console.log('rotate thru 1');

		if(!this.next())
		{
			return 'rotate thru 1';
		}
	},

	'http -rotate=1 thru': function()
	{
		console.log('rotate thru 2');

		return 'rotate thru 2 - not nexted';	
	},

	'http -rotate=2 thru': function()
	{
		console.log('rotate thru 3');

		if(!this.next())
		{
			return 'rotate thru 3';
		}
	},

	/**
	 */

	'http -rotate thru -> hello/:name': function()
	{
		return 'hello '+this.data.name+'!';
	},
	
	'http -rotate=1 thru -> hello/:name': function()
	{
		return 'sup';
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
				beanpole.http(Url.parse(req.url).pathname, null, { meta: { stream: 1 }, req: req }, function(writer)
				{
					writer.pipe(res);
				})
			});
		}

		for(var channel in channels)
		{
			var expr = channels[channel];

			if(expr.type == 'http')
			{
				initPath(channel, expr);
			}
		}

		srv.listen(8032);
	}


});


beanpole.push('init');