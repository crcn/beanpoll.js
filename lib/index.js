(function() {
  var Router;

  Router = require("./router");

  exports.Messenger = require("./concrete/messenger");

  exports.Director = require("./concrete/director");

  exports.Message = require("./message");

  exports.Response = require("./concrete/response");

  exports.router = function() {
    return new Router();
  };

}).call(this);
