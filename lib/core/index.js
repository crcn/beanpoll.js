require.paths.unshift(__dirname + '/beans');

var proxy = require('./proxy'); require('sk/node/log');

exports.Proxy = proxy.Proxy;
exports.ProxyRequest = proxy.ProxyRequest;

exports.mediator = new exports.Proxy();


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
	if(typeof src == 'object' && typeof src.bean == 'function')
	{
		src.plugin(proxy, src.params || exports.currentParams[ src.name ] || {});
	}
	else
	{
		return false
	}
	
	return proxy;
}



//lul it's just the proxy mediator.
exports.router = function()
{
	return new exports.Proxy();
}