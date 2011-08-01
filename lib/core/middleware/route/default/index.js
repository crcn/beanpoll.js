var Router = require('../../../base/router');

exports.types = ['dispatch'];

exports.test = function(expr)
{
	return !expr.type || expr.type == 'dispatch' ? 'dispatch': null;
}

exports.newRouter = function()
{
	return new Router();
}