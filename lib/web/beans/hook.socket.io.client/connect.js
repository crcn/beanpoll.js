var Connection = require('../../../core/beans/hook.socket.io/connection'),
Url = require('url');



exports.plugin = function(router)
{                           

	var onConnection;       

	router.on({
		
		/**
		 */

		'push host': function(value)
		{                       
			if(navigator.userAgent.toString().match(/firefox|msie/i)) io.transports = ['flashsocket','htmlfile','xhr-polling','jsonp-polling']; 
			
			if(value.indexOf('://') == -1) value = 'http://' + value;
			                                     
			
			var host = Url.parse(value);   
			                          
			var sio = io.connect(host.protocol + '//' + host.hostname + ':' + (host.port || 80) ),
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