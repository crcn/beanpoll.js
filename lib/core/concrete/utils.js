
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

exports.channelToStr = function(expr, omit)
{
	var buffer = [];

	if(!omit) omit = [];

	if(expr.type && !omit.type) buffer.push(expr.type);

	if(!omit.meta)
	for(var key in expr.meta)
	{
		buffer.push('-'+key+'='+expr.meta[key]);
	}

	var current = expr.channel;

	var middleware = [];

	while(current)
	{
		var paths = [];

		for(var i = 0, n = current.paths.length; i < n; i++)
		{
			var path = current.paths[i];
			 
			paths.push((path.param ? ':' : '')+ path.name);
		}

		middleware.unshift(paths.join('/'));

		current = current.thru;
	}

	buffer.push(middleware.join(' -> '));

	return buffer.join(' ');
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