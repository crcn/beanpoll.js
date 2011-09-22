var abstract = require('./abstract'),
net = require('./net');

var Connection = abstract.Connection.extend({
	
	/**
	 */

	'override cannotConnect': function()
	{
		this._super();
		this.timeoutReconnect();
	},

	/**
	 */

	'override isDown': function()
	{
		this._super();

		this.timeoutReconnect();
	},

	/**
	 */

	'timeoutReconnect': function()
	{
		var self = this;

		setTimeout(function()
		{
			// self._transport._router.push('hooks/add', { host: self.host, port: self.port });

			self._transport._tryReconnecting(self);
		}, 1000);
	}
});


var Transport = abstract.Transport.extend({

	/**
	 */

	'_tryReconnecting': function(con)
	{

		var self = this;

		console.notice('Trying to reconnect to %s', con);

		con.up(function(err, response)
		{
			if(err || !response.result) return setTimeout(function()
			{
				self._tryReconnecting(con);
			}, 5000);

			console.success('Host %s is back up!', con);

			self.hook(con);
		});

		/*net._get({ method: 'GET', host: con.hostname, port: con.port, path: '/hooks/up' }, function(err, result)
		{
			conso
		})*/
	},


	/**
	 */

	'test': function(host)
	{
		return host.protocol == 'http' || host.protocol == 'https';
	},

	/**
	 */

	'newConnection': function(host)
	{
		return new Connection(host, this);
	}
});



exports.init = function(router)
{

	var transport;

	return {
		test: function(host)
		{
			return transport.test(host);
		},
		hook: function(host)
		{
			return transport.hook(host);
		},
		connect: function(onConnection)
		{
			if(!transport)
			{
				transport = new Transport();
				transport.plugin(router);
			}

			transport.addListener('connection', onConnection);
		}
	}
}