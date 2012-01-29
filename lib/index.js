(function() {
  var Router;

  Router = require("./router");

  exports.Messenger = require("./concrete/messenger");

  exports.Director = require("./concrete/director");

  exports.router = function() {
    return new Router();
  };

}).call(this);
