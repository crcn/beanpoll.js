(function() {
  var PullDispatcher,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  PullDispatcher = require("../pull/dispatcher");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype._prepareRequest = function(route) {
      return this._findListeners(route);
    };

    /*
    */

    _Class.prototype._prepareRoute = function(route) {
      return route;
    };

    return _Class;

  })(PullDispatcher);

}).call(this);
