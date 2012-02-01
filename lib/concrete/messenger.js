(function() {
  var LinkedQueue, Response, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  LinkedQueue = require("../collections/linkedQueue");

  Response = require("./response");

  _ = require("underscore");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    /*
    	 constructor
    */

    function _Class(message, first, director) {
      var _this = this;
      this.message = message;
      this.first = first;
      this.director = director;
      this.router = director.router;
      this.from = message.from;
      _Class.__super__.constructor.call(this, first);
      this.response = new Response(this);
      this.response.reader().dump(function() {
        return _this.message.callback.apply(_this.message, arguments);
      }, this.message.headers);
    }

    /*
    */

    _Class.prototype.start = function() {
      return this.next();
    };

    /*
    */

    _Class.prototype.data = function(name) {
      var obj, _i, _len;
      if (arguments.length === 0) {
        return _.extend({}, this.params(this.query));
      } else if (arguments.length > 1) {
        obj = {};
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          name = arguments[_i];
          obj[name] = this.data[name];
        }
        obj;
      }
      return this.params[name] || this.query[name];
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
      try {
        return this._next(middleware, args);
      } catch (e) {
        return this.response.error(e);
      }
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
