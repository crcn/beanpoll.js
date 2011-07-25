var proxy = require('./proxy');

exports.Proxy = proxy.Proxy;
exports.ProxyRequest = proxy.ProxyRequest;
exports.mediator = new exports.Proxy();
require('sk/node/log')

require.paths.unshift(__dirname + '/pods');

//
exports.currentParams = {};

exports.params = function(params)
{
	exports.currentParams = params || {};
	
	return exports;
}

exports.require = function(src, proxy)
{
	if(!proxy) proxy = export.mediator;
	
	proxy.require = exports.require;
	
	if(src instanceof Array)
	{
		for(var i = src.length; i--;)
		{
			exports.require(src[i], proxy);
		}
	}
	else
	if(typeof src == 'object' && typeof src.pod == 'function')
	{
		src.pod(proxy, src.params || exports.currentParams[ src.name ] || {});
	}
	else
	{
		return false
	}
	
	return proxy;
}
