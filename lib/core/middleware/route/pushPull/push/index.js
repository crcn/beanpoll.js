var Router = require('./router');

exports.types = ['push'];

exports.test = function(expr)
{
	return expr.type == 'push';
}

exports.newRouter = function()
{
	return new Router({ multi: true });
}