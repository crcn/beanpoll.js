(function() {
  var AbstractDispatcher, Messanger, Response,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  AbstractDispatcher = require("../concrete/dispatcher");

  Messanger = require("./messanger");

  Response = require("./response");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype._newMessanger = function(message, middleware) {
      var msgr;
      msgr = new Messanger(message, middleware, this);
      msgr.response.reader.dump(message.callback, message.headers);
      return msgr;
    };

    /*
    */

    _Class.prototype._prepareRequest = function(route) {
      var listeners;
      listeners = _Class.__super__._prepareRequest.call(this, route);
      if (!!listeners.length) {
        return [listeners[0]];
      } else {
        return [];
      }
    };

    /*
    */

    _Class.prototype._prepareRoute = function(route) {
      var filtered;
      filtered = this._findListeners(route, false);
      if (!!filtered.length && !(route.tags.before || route.tags.after)) {
        throw new Error("Route \"" + route.channel.value + "\" already exists");
      }
      return route;
    };

    return _Class;

  })(AbstractDispatcher);

}).call(this);
