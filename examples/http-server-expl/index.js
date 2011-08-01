var beanpole = require('../../lib/node').router(),
express = require('express'),
Url = require('url');

beanpole.on({

	/**
	 */

	'pull -rotate thru': function()
	{
		console.log('rotate thru 1');

		if(!this.next())
		{
			return 'rotate thru 1';
		}
	},

	/**
	 */

	'pull -rotate=1 thru': function()
	{
		console.log('rotate thru 2');

		return 'rotate thru 2 - not nexted';	
	},

	/**
	 */

	'pull -rotate=2 thru': function()
	{
		console.log('rotate thru 3');

		if(!this.next())
		{
			return 'rotate thru 3';
		}
	},

	/**
	 */

	'pull -rotate thru -> hello/:name': function()
	{
		return 'hello '+this.data.name+'!';
	},
	
	/**
	 */

	'pull -rotate=1 thru -> hello/:name': function()
	{
		return 'sup';
	},

	/**
	 */


	'http session': function()
	{
		console.log(this.req.headers)
		console.log("TESTING")
		this.next();
	},

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