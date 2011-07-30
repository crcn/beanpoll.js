exports.meta = ['intercept'];
exports.all = ['getRoute'];

exports.intercept = {};


exports.getRoute = function(ops)
{
	for(var prop in ops.data)
	{
		var route;

		if(route = exports.intercept[prop])
		{
			ops.thru.unshift(route);
		}
	}
};

exports.setRoute = function(ops)
{
	var intercept = ops.meta.intercept.split(',');

	for(var i = intercept.length; i--;)
	{
		exports.intercept[intercept[i]] = ops;
	}
};