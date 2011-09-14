var Connection = require('../../../core/beans/hook.socket.io/connection');



exports.plugin = function(router)
{

	var onConnection;

	router.on({
		
		/**
		 */

		'push host': function(value)
		{
			if(navigator.userAgent.toString().match(/firefox|msie/i)) io.transports = ['flashsocket','htmlfile','xhr-polling','jsonp-polling'];
			//io.transports = ['jsonp-polling'];

			var sio = io.connect('http://'+value+':80'),
			socket;


			sio.on('connect', function()
			{ 
				router.push('set/id', sio.socket.sessionid);

				onConnection(new Connection(sio));
			});
		}
	})



	return {
		connect: function(onCon)
		{
			onConnection = onCon;
		}
	}
}