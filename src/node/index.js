                                
//fix issue where brazilnut's used in other modules with node_modules directory. thanks npm >.>.
global.brazilnut = global.brazilnut || module.exports;
var brazilnut = require('../core'),
	fs = require('fs'),
	pt = require('path');


require.paths.unshift(__dirname + '/pods');

exports.Proxy = brazilnut.Proxy;
exports.mediator = brazilnut.mediator;
exports.params = brazilnut.params;
exports.loaded = [];

var oldRequire = brazilnut.require;

var _require = function(pod, proxy)
{
	try
	{
		var path = require.resolve(pod);
	}
	catch(e)
	{
		return false;
	}
	
	var ret = require(pod),
	name = pt.dirname(path).split('/').pop();

	if(proxy.loaded.indexOf(name) > -1)
	{
		console.notice('Cannot reload pod "%s"', pod);
		
		return { pod: function() {} };
	}
	
	exports.loaded.push(name);
	proxy.loaded.push(name);
	
	return ret;
}


exports.require = brazilnut.require = function(src, proxy)
{
	if(!proxy) proxy = brazilnut.mediator;
	if(!proxy.loaded) proxy.loaded = [];
	
	if(!oldRequire(src, proxy))
	{
		if(typeof src == 'object')
		{
			for(var pod in src)
			{
				_require(pod, proxy).pod(proxy, src[pod]);
			}
		}
		else
		if(typeof src == 'string')
		{
			var pod;
			
			if(!(pod = _require(src, proxy)))
			{
				try
				{
					//NOT a pod, but a directory for the pods.
					fs.readdirSync(src).forEach(function(name)
					{
						//hidden file
						if(name.substr(0,1) == '.') return;

						_require(src + '/' + name, proxy).pod(proxy, brazilnut.currentParams[name] || {});
					});
				}
				catch(e)
				{
					console.log(e.stack)
					console.error('Unable to load pod: "%s"', src);
				}				
			}
			else
			{
				pod.pod(proxy, brazilnut.currentParams[src.split('/').pop()] || {});
			}
		}
		else
		{
			return false;
		}
		
		return proxy;
	}
	
	//this gets hit if old require is true
	return proxy;
}