var Hook = require('./hook'),
lazy = require('sk/core/lazy');
	
exports.plugin = function(mediator, host)
{
	var oldAddChannel = mediator.addChannel, 
	readyBeans = {},
	identifier;

	// mediator.middleware.add(require('./middleware/hook'));
	
	mediator.addChannel = function(path, expr)
	{
		oldAddChannel.apply(mediator, arguments);

		//change here
		// mediator.push('channels', )
		lazyPush();
	}

	function init()
	{
		mediator.pullMulti('hook/transport', function(transport)
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

	function getHook(data)
	{
		var d = data || {};

		var channels = [],
			ch = mediator.channels();

		for(var channel in ch)
		{
			var expr = ch[channel];

			//make sure not to use any networked call
			if((!d.all && !expr.meta.bussed && expr.meta.hooked) || !expr.meta['public']) continue;


			channels.push({ meta: expr.meta, path: channel });
		}


		var info = {
			id: identifier,
			channels: channels
		}
		
		return info;
	}

	function pullHook(request)
	{
		return getHook(request.data);
	}

	function pushHook()
	{
		mediator.push('hook', getHook());
	}

	var lazyPush = lazy.callback(pushHook,1);

	function onAppId(data)
	{
		console.log(data)
	}


	function setId(value)
	{
		identifier = value;
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

		//the key for the cluster / user / computer
		'push set/id': setId,

		'push hook/connection': onConnection,
	});
}