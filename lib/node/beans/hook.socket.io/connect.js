var express = require('express'),
io = require('socket.io'),
Connection = require('../../../core/beans/hook.socket.io/connection');

var ServerConnection = Connection.extend({
	
	'override __construct': function(socket)
	{
		this._super(socket);

		this.bussed = true;
	}
})

exports.connect = function(onConnection)
{
	var srv = io.listen(6032);

	srv.sockets.on('connection', function(socket)
	{
		onConnection(new ServerConnection(socket));
	});
}