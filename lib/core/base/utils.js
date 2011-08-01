
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