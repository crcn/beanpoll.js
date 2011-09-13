var Connection = require('../../../core/beans/hook.socket.io/connection');



exports.plugin = function(router)
{
	return {
		connect: function(onConnection)
		{

			if(navigator.userAgent.toString().match(/firefox|msie/i)) io.transports = ['flashsocket','htmlfile','xhr-polling','jsonp-polling'];

			var socket = io.connect('http://' + window.location.host),
			socket;
		 
			socket.on('connect', function()
			{ 
				router.push('set/id', socket.socket.sessionid);

				onConnection(new Connection(socket));
			});

		}
	}
}