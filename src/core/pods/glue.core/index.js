var RemoteGlue = require('./glue').RemoteGlue,
	sys = require('sys')
	
exports.pod = function(mediator, host)
{
	var oldAddChannel = mediator.addChannel;

	mediator.addChannel = function(path, expr)
	{
		oldAddChannel.apply(mediator, arguments);

		// mediator.push('channels', )
	}

	function init()
	{
		mediator.pull('glue/transport', function(transport)
		{
			new RemoteGlue(transport, mediator);
		});
	}

	function onPodReady(name)
	{
		readyPods.push(name);
	}

	function getChannels()
	{
		var channels = [],
			ch = mediator.channels();

		for(var channel in ch)
		{
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
		'push ready': onPodReady,
		'pull channels': pullChannels,
		'push -pull app/id': onAppId
	});

	
}