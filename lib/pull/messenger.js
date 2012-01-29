(function() {
  var Messenger, Response,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Messenger = require("../concrete/messenger");

  Response = require("./response");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype.start = function() {
      var _this = this;
      this.response = new Response(this);
      this.response.reader().dump((function() {
        return _this.message.callback.apply(_this.message, arguments);
      }), this.message.headers);
      return _Class.__super__.start.call(this);
    };

    /*
    */

    _Class.prototype._next = function(middleware) {
      this.message.cache(this.hasNext);
      return middleware.listener(this.message, this.response, this);
    };

    /*
    */

    _Class.prototype._onError = function(error) {
      return this.response.error(error);
    };

    return _Class;

  })(Messenger);

}).call(this);
