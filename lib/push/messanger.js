(function() {
  var AbstractMessanger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  AbstractMessanger = require("../concrete/messanger");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype._next = function(middleware) {
      this.message.cache(this._hasNext);
      return this.message.dump(function(err, result) {
        return middleware.listener.callback(result);
      }, middleware.listener.route.tags);
    };

    return _Class;

  })(AbstractMessanger);

}).call(this);