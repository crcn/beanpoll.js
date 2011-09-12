var transport = require('./transport');
	
	
exports.plugin = function(router, host)
{
    
	router.on({

		/**
		 */

		'pull -multi hook/transport': function()
		{
			return transport;
		}
	})
}