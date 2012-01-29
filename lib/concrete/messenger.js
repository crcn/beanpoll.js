(function() {
  var LinkedQueue,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  LinkedQueue = require("../collections/linkedQueue");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    /*
    	 constructor
    */

    function _Class(message, first, director) {
      this.message = message;
      this.first = first;
      this.director = director;
      this.router = director.router;
      _Class.__super__.constructor.call(this, first);
    }

    /*
    */

    _Class.prototype.start = function() {
      return this.next();
    };

    /*
    */

    _Class.prototype._onNext = function(middleware, args) {
      if (args.length) {
        if (args[0]) {
          return _onError(args[0]);
        } else {
          _onNextData(args[1]);
        }
      }
      this.message.params = middleware.params;
      return this._next(middleware, args);
    };

    /*
    */

    _Class.prototype._next = function(middleware) {
      return middleware.listener(this);
    };

    /*
    */

    _Class.prototype._onError = function(error) {};

    /*
    */

    _Class.prototype._onNextData = function() {};

    return _Class;

  })(LinkedQueue);

}).call(this);
