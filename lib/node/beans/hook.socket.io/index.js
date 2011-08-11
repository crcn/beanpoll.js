var express = require('express');


exports.plugin = function(router)
{


	router.on({
		
		/**
		 */

		'pull -multi hook/transport': function()
		{
			return require('./connect');
		}
	})	
}