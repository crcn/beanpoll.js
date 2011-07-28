                                
//fix issue where beanpole's used in other modules with node_modules directory. thanks npm >.>.
global.beanpole = global.beanpole || module.exports;
var beanpole = require('../core'),
	fs = require('fs'),
	pt = require('path');


require.paths.unshift(__dirname + '/beans');

exports.Proxy = beanpole.Proxy;
exports.mediator = beanpole.mediator;
exports.params = beanpole.params;
exports.router = beanpole.router;
exports.loaded = [];

var oldRequire = beanpole.require;

var _require = function(bean, proxy)
{
	try
	{
		var path = require.resolve(bean);
	}
	catch(e)
	{
		return false;
	}
	
	var ret = require(bean),
	name = pt.dirname(path).split('/').pop();

	if(proxy.loaded.indexOf(name) > -1)
	{
		console.notice('Cannot reload bean "%s"', bean);
		
		return { plugin: function() {} };
	}
	
	exports.loaded.push(name);
	proxy.loaded.push(name);
	
	return ret;
}


exports.require = beanpole.require = function(src, proxy)
{
	if(!proxy) proxy = beanpole.mediator;
	if(!proxy.loaded) proxy.loaded = [];
	
	if(!oldRequire(src, proxy))
	{
		if(typeof src == 'object')
		{
			for(var bean in src)
			{
				_require(bean, proxy).plugin(proxy, src[bean]);
			}
		}
		else
		if(typeof src == 'string')
		{
			var bean;
			
			if(!(bean = _require(src, proxy)))
			{
				try
				{
					
					//NOT a bean, but a directory for the beans.
					fs.readdirSync(src).forEach(function(name)
					{
						//hidden file
						if(name.substr(0,1) == '.') return;

						_require(src + '/' + name, proxy).plugin(proxy, beanpole.currentParams[name] || {});
					});
				}
				catch(e)
				{
					console.log(e.stack)
					console.error('Unable to load bean: "%s"', src);
				}				
			}
			else
			{
				bean.plugin(proxy, beanpole.currentParams[src.split('/').pop()] || {});
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