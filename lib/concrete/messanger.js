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

    function _Class(message, first, dispatcher) {
      this.message = message;
      this.first = first;
      this.dispatcher = dispatcher;
      _Class.__super__.constructor.call(this, first);
      this.router = dispatcher.router;
      this.headers = message.headers;
      this.query = message.query;
    }

    /*
    	 proxy to message
    */

    _Class.prototype.on = function(type, fn) {
      return this.message.on(type, fn);
    };

    /*
    */

    _Class.prototype.dump = function(callback) {
      return this.message.dump(callback);
    };

    /*
    */

    _Class.prototype.start = function() {
      return this.next();
    };

    /*
    */

    _Class.prototype._onNext = function(middleware) {
      var i, path, _len, _ref;
      _ref = middleware.listener.route.channel.paths;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        path = _ref[i];
        if (path.param) this.query[path.value] = middleware.channel.paths[i].value;
      }
      return this._next(middleware);
    };

    /*
    */

    _Class.prototype._next = function(middleware) {
      return middleware.listener.callback(this);
    };

    return _Class;

  })(LinkedQueue);

}).call(this);
