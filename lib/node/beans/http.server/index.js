var http = require('http'),
https = require('https'),
exec = require('child_process').exec,
vine = require('vine');


exports.plugin = function(router, params) 
{

	var servers = { }, _hostname, httpHost;

	function hostname(callback)
	{
		if(_hostname) return callback(_hostname);

		exec('hostname', function(err, hostname)
		{
			callback(_hostname = hostname.replace('\n',''));
		})
	}
    

	
    router.on({

    	/**
    	 */

        'push init': function()
        {
        	//params present? start the http port
			if(params)
			{
				if(params.http)
				{
					router.pull('http/start', params.http, function(){});
				}
			}
	    },  

	    /**
	     */

	    'pull http/start': function(request)
	    {
	    	var secure = request.data.secure,
	    	port = request.data.port || (secure ? 443 : 8000),
		    serv = secure ? https : http,
            cached = servers[secure];
            

            function listen(inst)
            {
                try
                {
                    inst.listen(port);
                    inst.port = port;

                    console.success('Started http server on port %d', port);
                    
                    if(!inst.pushed) router.push('http/server', inst);
                    
                    inst.pushed = true;
                    
                    hostname(function(name)
                    {
                        router.push('http/host', httpHost = { hostname: name, port: port });
                    })
                    
                    request.end(inst);
                }
                catch(e)
                {
                    var msg = 'Unable to start http server on port %d';
                    
                    console.warn(msg, port);
                    
                    request.end(vine.error(msg, port).end());
                }
                
                return inst;
            }
	    	
	    	if(cached)
            {
                function onCached()
                {
                    listen(cached);
                };
                
                if(cached.fd && cached.port != port)
                {
                    try
                    {
                        cached.once('close', onCached);
                        cached.close();
                    }
                    catch(e)
                    {
                        onCached();
                    }
                }
                else
                {   

                    if(cached.fd)
                    {
                        console.notice('http server on port %s is already running', cached.port);
                        request.end(cached);
                    }
                    else
                    {
                        listen(cached);
                    }
                    
                }
                return;
            }

            listen(servers[secure] = serv.createServer());
	    },

	    /**
	     */

	    'pull http/host': function()
	    {
	    	return httpHost;
	    }

    })
}
