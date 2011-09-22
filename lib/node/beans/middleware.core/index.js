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
			if(this.session)
			{
				this.next();
				return;
			}

			var sessid = this.data.sessid,

			//key is an additional safe guard against session injections.
			key = 'undefined',
			req = this.req,
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
				self.session = session;
				
				self.respond({ session: session });

				if(!self.next()) vine.message('session set').end(self);
			});
		},


		/**
		 * basic authentication passthru
		 */

		'pull -private (basic/auth/:user/:pass or basic/auth)': function()
		{
			if(!this.req) return vine.error('basic auth is specific to http for now').end();

			var self = this;


			basic.test({
				request: self.req,
				login: this.login || function(user, pass, callback)
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
						self.respond({ authorization: { http: err } });

						return self.end(vine.error('Unauthorized.').end());
					}

					self.profile = self.account = user;


					if(!self.next()) vine.message('Authorized').result(user).end(self)
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