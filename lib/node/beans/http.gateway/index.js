/**
 * exposes public channels to HTTP - instant api ;)
 */

var vine = require('vine'),
prettyjson = require('./prettyjson'),
Url = require('url'),
mime = require('mime'),
Structr = require('structr'),
Middleware = require('./middleware'),
fs = require('fs');



exports.plugin = function(router, params) 
{ 
 	var mw = new Middleware();


 	function sendFile(path, res, m)
 	{
 		if(!res) res = this.res;

		fs.stat(path, function(err, stat)
		{
			if(err || stat.isDirectory())
			{           
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.end("404");
				return;
			}

			res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': m || mime.lookup(path) } );
			

			fs.createReadStream(path, {flags: 'r', 
			encoding: 'binary', 
			mode: 0666,
			bufferSize: 4 * 1024})

			.addListener("data", function(chunk){
				res.write(chunk, 'binary');
			})
			.addListener("end", function(chunk){
				//  emitter.emit("success", statCode);
			})
			.addListener("close",function() {
				res.end();
			})
			.addListener("error", function (e) {
				//emitter.emit("error", 500, e);
			});
		}); 
 	}


 	//TODO: this shouldn't be here :/
 	mw.add(function(ops, next)
 	{

 		//channel exists? skip
 		if(ops.exists) return next();

		var fullPath = ((params.dir || '') + '/' + ops.pathname).replace(/\/+/g,'/'),
		res = ops.res;
			
		sendFile(fullPath, res, ops.mime);
 	})
 	     

	function tryMeta(uri, key, value)
	{
		var meta = {};
		meta[key] = value;

		//return filter, or 1 for "the given request has this metadata"
		return router.has(uri, { meta: meta, type: 'pull'}) ? value : 1;
	}


	function routeListener(channel)
	{
		var route = router.getRoute(channel, { type: 'pull'});
		
		return route.listeners.length ? route.listeners[0] : null;
	}



	function _404(res)
	{
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end("Not Found");
	}

	function _401(res)
	{
		res.writeHead(401, {'Content-Type': 'text/plain'});
		res.end("Unauthorized");
	}


	function onRequest(req, res)
	{

		var urlParts = Url.parse(req.url, true),
		pathParts = urlParts.pathname.match(/(.*?)(?:\.(\w+))?$/);
		
		var channel = pathParts[1],
		fileType = pathParts[2],
		//mime needed for the response
		mimeType = mime.lookup(fileType || '', 'text/plain'),

		//query data
		query = Structr.copy(urlParts.query, req.query, true);

		//need to check a few things 
		var listener = routeListener(channel),
		meta = listener ? listener.meta : null;


		//not public? no http specified? it's private.
		if(meta && !meta['public'] && !meta['http'] && !meta['api'])
		{
			return _401(res);
		}

		var ops = { 

			//chanel we're invoking
			channel: channel,

			host: req.headers.host,

			//un-altered pathname
			pathname: urlParts.pathname,

			//data attached in the QS of the data
			query: query,

			//channel exists? use for FS
			exists: !!meta,

			mime: mimeType, 

			fileType: fileType,

			//tjhe actual request object
			req: req,

			res: res,

			//metadata by the channel
			channelMeta: meta || {},

			//meta used for the request
			requestMeta: { 

				//stream so we can pipe to the user
				stream: 1, 

				//passive = return even if the request doesn't exist
				passive: 1, 

				//try filtering out the request method before going to the default. e.g: GET, POST, PUT
				method: tryMeta(channel, 'method', req.method.toUpperCase()), 
			}
		};

		//run through the middleware, modify anything
		mw.request(ops, function(newOps)
		{

			//finally make the request
			router.pull(newOps.channel, newOps.query, { req: req, res: res, meta: newOps.requestMeta, host: newOps.host, sendFile: sendFile }, function(request)
			{

				//no request? channel doesn't exist
				if(!request) return _404(res);

				var headers = { };

				//this chunk is used to allow ajax applications to load data from the server
				headers['Access-Control-Allow-Origin'] =  req.headers.origin || '*';
	  
				//is ajax
				if(req.headers['access-control-request-headers'])
				{                            
					//i believe the timestamp is used so the access control is cached client side, omitting the need
					//to hit the server on every request
					headers['Date'] = (new Date()).toGMTString();
					
					//allow the headers that were sent
					headers['Access-Control-Allow-Headers'] =  request.headers['access-control-request-headers'];
					
					//allow only the most common methods
					headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
					
					//allow session data to be passed to the server from ajax. this should really be oauth since this is NOT supported
					//in older browsers
					//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					//from W3C: The string "*" cannot be used for a resource that supports credentials.
					//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					// r.headers['Access-Control-Allow-Credentials'] = 'true';
					
					//tell the client to store the access control for 17000 seconds
					headers['Access-Control-Max-Age'] = 17000; 
					 
					//cache for the time to live, OR 30 days
					// headers['Expires'] = new Date(new Date().getTime() + (route.ttl.client || 3600*24*30)*1000).toGMTString();     
				}



				this.pipe({

					/**
					 * translations from beanpole
					 */

					respond: function(response)
					{
						if(response.session)
						{
							headers['Set-Cookie'] = response.session.http;
						}

						//redirect to a different location
						if(response.redirect)
						{
							request.statusCode = 301;
							headers['Location'] = response.redirect.indexOf('://') > -1 ? response.redirect : 'http://' + (req.headers.host+'/'+response.redirect).replace(/\/+/g,'\/'); 
						}

						if(response.authorization)
						{
							headers['WWW-Authenticate'] = response.authorization.http;
							request.statusCode = 401;
						}


						if(response.mime)
						{
							newOps.mime = response.mime;
						}

						headers['Expires']		 = '17-Jan-2038 19:14:07 GMT';
						headers['Connection'] 	 = 'keep-alive';
						headers['Content-Type']  = urlParts.query.callback ? 'application/x-javascript' : newOps.mime;
						headers['Cache-Control'] = 'max-age=29030400, public';

						res.writeHead(request.statusCode || 200, headers);
					},

					/**
					 */

					write: function(data)
					{
						var chunk = data;

						if(data instanceof Object)
						{
							chunk = JSON.stringify(data);

							if(data.errors)
							{
								data.errors.forEach(function(error)
								{
									console.notice('HTTP Response: ' + error.message);
								})
							}
						}


						//meh >.>
						if(typeof chunk == 'boolean') chunk = chunk.toString();
							
						//pretty print? helps with debugging.
						if(query.pretty != undefined) chunk = prettyjson(chunk);

						//callback provided? wrap the response up
						if(urlParts.query.callback) chunk = request.data.callback +' (' + chunk + ');';


						//send the chunk
						res.write(chunk);
					},

					/**
					 */ 

					end: function()
					{
						res.end();
					}
				})
			});
		});

	}
           
           
 	var startingPort;

	
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
					router.pull('http/start', { port: params.http.port }, function(){});
				}
			}


			router.on({
				
		        /**
		         * middleware for the requests
		         */

		        'push -pull -multi http/request/middleware': function(middleware)
		        {
		        	mw.add(middleware);
		        }
			});
	    },    
        

        /**
         */
         
        'push http/server': function(server)
        {
            server.on('request', onRequest);
        }
    })
}
