var beanpole = require('../../lib/node');

beanpole.require(['hook.core','hook.http']).require(__dirname + '/beans').push('init');