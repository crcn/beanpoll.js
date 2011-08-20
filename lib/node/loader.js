var Structr = require('structr'),
Loader  = require('../core/loader'),
fs = require('fs'),
pt = require('path');


require.paths.unshift(__dirname + '/beans');

var NodeLoader = Loader.extend({
	
	/**
	 */


	'override __construct': function()
	{
		this._super();
		
		this._loaded = [];
	},

	/**
	 */

	'override require': function(source)
	{	
		if(!this._super(source))
		{
			if(typeof source == 'object')
			{
				for(var bean in source)
				{
					this._require(bean).plugin(this, source[bean]);
				}
			}
			else
			if(typeof source == 'string')
			{
				var bean, self = this;
				
				if(!(bean = this._require(source)))
				{
					try
					{
						
						//NOT a bean, but a directory for the beans.
						fs.readdirSync(source).forEach(function(name)
						{
							//hidden file
							if(name.substr(0,1) == '.') return;

							self._require(source + '/' + name).plugin(self, self._params[name] || {});
						});
					}
					catch(e)
					{
						console.log(e.stack)
						console.error('Unable to load bean: "%s"', source);
					}				
				}
				else
				{
					bean.plugin(this, self._params[source.split('/').pop()] || {});
				}
			}
			else
			{
				return false;
			}
			
			return this;
		}

		//this gets hit if old require is true
		return this;
	},
	
	/**
	 */

	'_require': function(bean)
	{
		try
		{
			var path = require.resolve(bean);
		}
		catch(e)
		{
			return false;
		}
		
		var ret = require(bean),
		name = pt.dirname(path).split('/').pop();


		if(this._loaded.indexOf(path) > -1)
		{
			console.notice('Cannot reload bean "%s"', bean);
			
			return { plugin: function() {} };
		}
		
		this._loaded.push(path);
		
		return ret;
	}
});

module.exports = NodeLoader;
