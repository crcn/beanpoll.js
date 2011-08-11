var Connection = require('../../../core/beans/hook.socket.io/connection');



exports.plugin = function(router)
{
	return {
		connect: function(onConnection)
		{
			
			var socket = io.connect('http://localhost:6032'),
			socket;
		 
			socket.on('connect', function()
			{ 
				router.push('set/id', socket.socket.sessionid);

				onConnection(new Connection(socket));
			});

		}
	}
}