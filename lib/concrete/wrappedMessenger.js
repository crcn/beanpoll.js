(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    return _Class;

  })(require("./messenger", {
    _next: function() {}
  }));

}).call(this);
