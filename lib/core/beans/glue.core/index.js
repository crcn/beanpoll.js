var RemoteGlue = require('./glue').RemoteGlue,
	sys = require('sys')
	
exports.plugin = function(mediator, host)
{
	var oldAddChannel = mediator.addChannel, 
	readyPods = [],
	groupId;

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

	function getGlue()
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


		var info = {
			group: groupId,
			channels: channels
		}
		
		return info;
	}

	function pullGlue(writer)
	{
		writer.end(getGlue());
	}

	function pushGlue()
	{
		mediator.push('glue', getGlue());
	}

	function onAppId(data)
	{
		console.log(data)
	}

	function setAppGroup(data)
	{
		groupId = data;

		pushGlue();
	}

	mediator.on({
		'push init': init,
		'push ready': onBeanReady,
		'pull -public glue': pullGlue,

		//used for grouping apps so they communcate with one another only
		'push set/app/group': setAppGroup,

		'push -pull app/id': onAppId
	});
}