(function() {
  var LinkedQueue,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  LinkedQueue = require("../../collections/linkedQueue");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    /*
    	 constructor
    */

    function _Class(message, first, dispatcher) {
      this.message = message;
      this.first = first;
      this.dispatcher = dispatcher;
      _Class.__super__.constructor.call(this, first);
      this.router = dispatcher.router;
    }

    /*
    */

    _Class.prototype._onNext = function(listener) {
      return listener(this);
    };

    return _Class;

  })(LinkedQueue);

}).call(this);
