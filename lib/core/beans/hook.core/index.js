var Hook = require('./hook'),
	sys = require('sys')
	
exports.plugin = function(mediator, host)
{
	var oldAddChannel = mediator.addChannel, 
	readyBeans = {},
	groupId;

	// mediator.middleware.add(require('./middleware/hook'));
	
	mediator.addChannel = function(path, expr)
	{
		oldAddChannel.apply(mediator, arguments);

		//change here
		// mediator.push('channels', )
	}

	function init()
	{
		mediator.pull('hook/transport', function(transport)
		{
			new Hook(transport, mediator);
		});
	}

	function onBeanReady(name)
	{
		readyBeans[name] = 1;

		mediator.on('pull '+name+'/ready', { meta: { 'public': 1, 'rotate': 1 } }, function()
		{
			return true;
		});
	}

	function getHook()
	{
		var channels = [],
			ch = mediator.channels();

		for(var channel in ch)
		{
			var expr = ch[channel];

			//make sure not to use any networked call
			if(expr.meta.hooked || !expr.meta['public']) continue;

			channels.push({ meta: expr.meta, path: channel });
		}


		var info = {
			cluster: groupId,
			channels: channels
		}
		
		return info;
	}

	function pullHook()
	{
		return getHook();
	}

	function pushHook()
	{
		mediator.push('hook', getHook());
	}

	function onAppId(data)
	{
		console.log(data)
	}

	function setAppGroup(data)
	{
		groupId = data;

		pushHook();
	}

	function onConnection(data)
	{
		// console.log(req.from.channels);

		for(var bean in readyBeans)
		{
			this.from.push(bean + '/ready', true, { ignoreWarning: true });
		}
	}

	mediator.on({
		'push init': init,
		'push ready': onBeanReady,
		'pull hook': pullHook,

		//used for grouping apps so they communcate with one another only
		'push set/app/group': setAppGroup,

		'push hook/connection': onConnection,
	});
}