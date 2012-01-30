(function() {
  var Director, Messenger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Director = require("../concrete/director");

  Messenger = require("./messenger");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype._newMessenger = function(message, middleware) {
      return new Messenger(message, middleware, this);
    };

    /*
    */

    _Class.prototype.addListener = function(route, callback) {
      this._validateListener(route, callback);
      return _Class.__super__.addListener.call(this, route, callback);
    };

    /*
    */

    _Class.prototype.getListeners = function(message) {
      return this.prepareListeners(_Class.__super__.getListeners.call(this, message));
    };

    /*
    */

    _Class.prototype.prepareListeners = function(listeners) {
      if (!!listeners.length) {
        return [listeners[0]];
      } else {
        return [];
      }
    };

    /*
    */

    _Class.prototype._validateListener = function(route) {
      var listeners;
      listeners = this._collection.get(route.channel, route.tags);
      if (!!listeners.length) {
        throw new Error("Route \"" + route.channel.value + "\" already exists");
      }
    };

    return _Class;

  })(Director);

}).call(this);
