(function() {
  var Stream,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Stream = require("stream").Stream;

  module.exports = (function(_super) {

    __extends(_Class, _super);

    /*
    */

    function _Class() {
      var _this = this;
      this.on("pipe", function(source) {
        return _this._onPipe(source);
      });
    }

    /*
    */

    _Class.prototype._onPipe = function(source) {
      return this.source = source;
    };

    return _Class;

  })(Stream);

}).call(this);
