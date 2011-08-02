var Structr = require('structr'),
utils = require('sk/node/utils'),
base64 = utils.base64,
uid = utils.uid,
Cookie = require('./cookies').Cookie;




var Session = Structr({
	'send': false,
	'__construct': function(ops, headers)
	{
		var self = this;
		
		//need to save the session when we're done
		this.manager = ops.manager;
		
		//the data saved for this session
		this.data = ops.data;
		
		//tells the request to set the cookie
		this.send = ops.send;
		
		//the id of the session
		this.id = ops.id;
		
		//used to help present session injecting
		this.key = ops.key;
	},
	'copy': function(target)
	{
		for(var key in target)
		{
			this.data[key] = target[key];
		}
	},
	'remove': function()
	{
		for(var i = arguments.length; i--;)
		{
			var arg = arguments[i];
			delete this.data[arg];
		}
	},
	'toJSON': function()
	{
		this.manager.save(this);

		return { id: this.id, http: Cookie.getString('sessid', this.id) }
	}
});


var SessionManager = Structr({
	'getSession': function(ops, callback)
	{
		var self = this;

		function onData(id, data)
		{
			var newOps = {
				manager:self
				,data:data || {}
				,send:!data
				,id:id
				,key:ops.key
			};
			
			callback(new Session(newOps));
		}

		
		if(ops.id)
		{
			this.getData(ops.id, ops.key, function(data)
			{
				//renew the session herer
				onData(ops.id, data);
			});
		}
		else
		{
			this.createNewSessid(onData)
		}
	}
});


var MemSessionManager = SessionManager.extend({
	sessions: {},
	reserved: {},
	'getData': function(id, key, callback)
	{
		var session = this.sessions[id] || {};
		
		//key must match up, or else we return nothing
		console.verbose("get cookie: "+id)
		
		callback(session.key == key ? session.data : null);
	},
	'save': function(session)
	{
		var headers = session.headers;
		console.verbose("save cookie: "+session.id)
		
		this.sessions[session.id] = {data: session.data, key: session.key };
	},
	'createNewSessid': function(callback)
	{
		//no session? create a new sessid
		while(this.reserved[id = uid()]);
		
		// console.verbose("new cookie: "+id)
		this.reserved[id] = 1;
		
		callback(id)
	}
});





exports.Cookie = Cookie;
exports.MemSessionManager = MemSessionManager;
