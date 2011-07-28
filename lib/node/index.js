if(global.beanpole)
{
	module.exports = global.beanpole;
}
else
{
	global.beanpole = module.exports = require('./beanpole');
}