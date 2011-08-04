exports.meta = ['intercept'];
exports.all = ['getRoute'];

exports.intercept = {};
exports.use = false;


exports.getRoute = function(ops)
{

	//don't waste overhead if interceptor's not being used
	if(exports.use)
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
	exports.use = true;

	var intercept = ops.meta.intercept.split(',');

	for(var i = intercept.length; i--;)
	{
		exports.intercept[intercept[i]] = ops;
	}
};