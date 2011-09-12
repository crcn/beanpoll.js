var express = require('express'),
io = require('socket.io'),
Connection = require('../../../core/beans/hook.socket.io/connection');

var ServerConnection = Connection.extend({
	
	'override __construct': function(socket)
	{
		this._super(socket);

		this.bussed = true;
	}
});

exports.init = function(server)
{ 
	return { connect: function(onConnection)
        {
            var srv = io.listen(server);

            srv.sockets.on('connection', function(socket)
            {
                onConnection(new ServerConnection(socket));
            });
        }
    }
}
