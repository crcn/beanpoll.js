var http = require('http'),
express = require('express');


var srv = http.createServer();

srv.listen(8080);

var srv2 = express.createServer();

console.log(srv);
//srv2.listen(srv);