var connect = require('./connect');

exports.plugin = function(router)
{

	var con = connect.plugin(router);

	router.on({
		/**
		 */

		'pull -multi hook/transport': function()
		{
			return con;
		}
	})
}