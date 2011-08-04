
/**
 * replaces params of the given expression
 */


exports.replaceParams = function(expr, params)
{

	var path;

	for(var i = expr.channel.paths.length; i--;)
	{
		path = expr.channel.paths[i];

		if(path.param)
		{

			path.param = false;
			path.name = params[path.name];

			//no name? IT MUST EXIST. DELETE!
			if(!path.name) expr.channel.paths.splice(i, 1);
		}
	}

	return expr;
}


exports.pathToString = function(path)
{
	var paths = [];

	for(var i = 0, n = path.length; i < n; i++)
	{
		var pt = path[i];

		paths.push(pt.param ? ':' + pt.name : pt.name);	
	}

	return paths.join('/');
}

exports.passThrusToArray = function(expr)
{
	var cpt = expr.thru,
	thru = [];

	while(cpt)
	{
		thru.push(this._pathToString(cpt.paths));
		cpt = cpt.thru;
	}

	return thru;
}