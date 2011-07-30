exports.meta = ['rotate'];
exports.allowMultiple = true;

exports.getRoute = function(ops)
{
	var route = ops.route,
		listeners = ops.listeners;

	//if rotate is specified, then we need to rotate it (round-robin). There's a catch though...
	//because the above *might* have filtered down to metadata values, we need to only rotate what's left, AND
	//the rotate index must be stuck with the routes rotate metadata.
	//Also, if the router can have multiple, then we cannot do round-robin. FUcKs ShiT Up.
	if(!ops.router._allowMultiple && route._meta && route._meta.rotate != undefined && listeners.length)
	{
		route._meta.rotate = (++route._meta.rotate) % listeners.length;

		//only ONE listener now..
		ops.listeners = [listeners[route._meta.rotate]];
	}
}


exports.setRoute = function(ops)
{
	
}

