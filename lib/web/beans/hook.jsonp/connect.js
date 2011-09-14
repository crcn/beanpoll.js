var Connect


exports.plugin = function(router)
{
    
    var host;

	router.on({
		
		/**
		 */

		'push host': function(value)
		{
			io.transports = ['jsonp-polling'];

			var socket = io.connect('http://' + value),
			socket;
		 	
		 	console.log(value);

			socket.on('connect', function()
			{ 
				console.log("CONNECT SOCKET.IO");

				router.push('set/id', socket.socket.sessionid);

				onConnection(new Connection(socket));
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