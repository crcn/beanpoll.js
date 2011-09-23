
var realm = "Authorization";


function parseAuth(auth)
{
	var authCredits = new Buffer(auth.substr(6), 'base64').toString('ascii').split(':');//skip Basic 
		
	var user = authCredits[0];
	var pass = authCredits[1];
	
	return {user: user, pass: pass};
};


exports.test = function(ops)
{

	function fail()
	{
		ops.callback('Basic realm="'+realm+'"');
		
			// request.statusCode = 401;
			// request.headers['WWW-Authenticate'] = 'Basic realm="'+realm+'"';//`, qop="auth" ,nonce="'+(new Date().getTime())+'",opaque="'+opaque+'"'

			// request.end("Not authorized."); 
	}

	var authCredits = ops.request.headers['authorization']

	//if the client has sent authorization headers, then continue logging them in.
	if(authCredits) //look for something like: Basic ZmRhZjpmc2Rmc2Rmc2ZzZA==
	{
		//1. strip away Basic
		//2. decode the b64 encoded string
		//3. split apart username:password
		var authCredits = parseAuth(authCredits);
		
		var user = authCredits.user;
		var pass = authCredits.pass;

		ops.login(user, pass, function(err, user)
		{	
			//if we've failed, 
			if(!user) return fail();

			ops.callback(false, user);

		});

		//stop from logging in
		return;
	}

	fail();
}


// exports.BasicAuth = BasisAuth;