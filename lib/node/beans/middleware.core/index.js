var session = require('./session/session');

exports.plugin = function(router)
{
	router.on({
		
		/**
		 */

		'pull session': function()
		{
			console.log(this)
		}
	})
}