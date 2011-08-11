var beanpole = require('../../../../lib/core').router();

require('../../../../lib/core/beans/hook.core').plugin(beanpole);
require('../../../../lib/web/beans/hook.socket.io').plugin(beanpole);

beanpole.on({
	 
	/**
	 */

	'push -public spice.io/ready': function()
	{ 
		console.log('ready!');

		console.log(beanpole.channels());

		for(var i = 10; i--;)
		beanpole.push('add/thyme', { channel: 'some/random/callback', data: { _id: new Date().getTime() + 2000, message: 'hello world!!!!!!' }})
	},

	/**
	 */

	'pull -public some/random/callback': function(request)
	{
		console.log("CALLBACK");

		console.log(this.data);


		request.end();
	},

	/** 
	 */
	 
	'pull -public get/name': function()
	{
		return "CRAAAAAIIIGGGG!!";
	}
});

beanpole.push('ready','client');
beanpole.push('init');   
