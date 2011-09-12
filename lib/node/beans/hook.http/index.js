var concrete = require('./concrete');
	
	
exports.plugin = function(router, host)
{
	router.on({

		/**
		 */

		'pull -multi hook/transport': function()
		{
			return concrete.init(router);
		}
	})
}