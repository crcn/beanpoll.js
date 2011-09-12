var connectHttpTransport = require('./http');
	
	
exports.plugin = function(router, host)
{
	router.on({

		/**
		 */

		'pull -multi hook/transport': function()
		{
			return connectHttpTransport;
		}
	})
}