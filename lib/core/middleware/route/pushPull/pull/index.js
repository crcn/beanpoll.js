var Router = require('../../../../concrete/router'),
Request = require('./request');

exports.types = ['pull'];

exports.test = function(expr)
{
	return expr.type == 'pull' ? (expr.meta.multi ? 'pullMulti' : 'pull') : null;
}

exports.newRouter = function(type)
{
	var ops = { RequestClass: Request };

	if(type == 'pullMulti') ops.multi = true;

	return new Router(ops);
}