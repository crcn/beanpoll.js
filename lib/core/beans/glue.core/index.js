var RemoteGlue = require('./glue').RemoteGlue,
	sys = require('sys')
	
exports.plugin = function(mediator, host)
{
	var oldAddChannel = mediator.addChannel, readyPods = []

	mediator.addChannel = function(path, expr)
	{
		oldAddChannel.apply(mediator, arguments);

		//change here
		// mediator.push('channels', )
	}

	function init()
	{
		mediator.pull('glue/transport', function(transport)
		{
			new RemoteGlue(transport, mediator);
		});
	}

	function onBeanReady(name)
	{
		readyPods.push(name);
	}

	function getChannels()
	{
		var channels = [],
			ch = mediator.channels();

		for(var channel in ch)
		{
			var expr = ch[channel];

			//make sure not to use any networked call
			if(expr.meta.glued || !expr.meta['public']) continue;


			channels.push(channel);
		}
		
		return channels;
	}

	function pullChannels(writer)
	{
		writer.end(getChannels());
	}

	function onAppId(data)
	{
		console.log(data)
	}

	mediator.on({
		'push init': init,
		'push ready': onBeanReady,
		'pull -public channels': pullChannels,
		'push -pull app/id': onAppId
	});
}