var Router = require('./router');

exports.types = ['http'];

exports.test = function(expr)
{
	return expr.type == 'http' ? 'http' : null;
}

exports.newRouter = function(type)
{
	return new Router();
}