var MemSessionManager = require('./session/session').MemSessionManager,
	Cookie = require('./session/cookies').Cookie,
	vine = require('vine'),
	basic = require('./auth/basic');


exports.plugin = function(router)
{

	var session = new MemSessionManager();

	router.on({
		
		/**
		 */

		'pull -private session': function()
		{
			var sessid = this.data.sessid,

			//key is an additional safe guard against session injections.
			key = 'undefined',
			req = this.target.ops.req,
			self = this;

			//http?
			if(req)
			{
				key = req.headers['user-agent'];
				var sessidParts = (req.headers['cookie'] || '').match(/sessid=([^;]+)/);
				if(sessidParts) sessid = sessidParts[1];
			}
			
			session.getSession( { id: sessid, key: key }, function(session)
			{
				self.internal.session = session;

				self.response({ session: session });

				if(!self.next()) vine.message('session set').end(self);
			});
		},


		/**
		 * basic authentication passthru
		 */

		'pull -private basic/auth/:user/:pass': function()
		{
			if(!this.target.ops.req) return vine.error('basic auth is specific to http for now').end();

			var self = this;


			basic.test({
				request: self.target.ops.req,
				login: function(user, pass, callback)
				{
					if(self.data.user == user && self.data.pass == pass)
					{
						callback(false, { name: user, pass: pass });
					}
					else
					{
						callback(true);
					}
				},
				callback: function(err, user)
				{
					if(err)
					{
						self.response({ authorization: { http: err } });

						return self.end(vine.error('Unauthorized.'));
					}

					self.internal.user = user;

					if(!self.next()) vine.message('Authorized').end(self)
				}
			});
		},

		/**
		 * parses post body
		 */

		/*'pull -private /*': function()
		{


			if(!this.next())
			{
				return "GOLD"
			}
		}*/
	})
}