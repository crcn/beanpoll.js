(function() {
  var AbstractMessanger, Response,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  AbstractMessanger = require("../concrete/messanger");

  Response = require("./response");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    /*
    	 constructor
    */

    function _Class(message, first, dispatcher) {
      _Class.__super__.constructor.call(this, message, first, dispatcher);
      this.response = new Response(this);
    }

    /*
    */

    _Class.prototype._onNext = function(middleware) {
      this.message.cache(this._hasNext);
      return middleware.listener(this, this.response);
    };

    return _Class;

  })(AbstractMessanger);

}).call(this);
