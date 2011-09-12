var express = require('express'),
connect = require('./connect')

 
exports.plugin = function(router, params)
{
	router.require('http.server');

	router.on({

		/**
		 */

		'push init': function()
		{
			if(params && params.port)
			{
				router.pull('http/start', params, function(){});
			}
		},
		
		/**
		 */

		'push -pull http/server': function(server)
		{
			router.push('hook/transport', connect.init(server));
		}
	})	
}