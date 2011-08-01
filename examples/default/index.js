var beanpole = require('../../lib/node').router();
	


function sayHi(message)
{
	console.log(message);
}

beanpole.on({
	'hello': sayHi
});

beanpole.dispatch('hello','world!');