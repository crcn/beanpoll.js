(function() {
  var Messenger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Messenger = require("../concrete/messenger");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype.start = function() {
      this.message.callback();
      return _Class.__super__.start.call(this);
    };

    /*
    */

    _Class.prototype._next = function(middleware) {
      this.message.cache(this.hasNext);
      if (middleware.tags.stream) {
        return middleware.listener.callback(this.message, this);
      } else {
        return this.message.dump(function(err, result) {
          return middleware.listener(result, this);
        });
      }
    };

    return _Class;

  })(Messenger);

}).call(this);
