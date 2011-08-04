var Router = require('./router');

exports.types = ['pull'];

exports.test = function(expr)
{
	return expr.type == 'pull' ? (expr.meta.multi ? 'pullMulti' : 'pull') : null;
}


exports.newRouter = function(type)
{
	return new Router( type == 'pullMulti' ? { multi: true } : null);
}