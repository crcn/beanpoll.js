(function() {
  var AbstractDispatcher, RequestMiddleware, RouteCollection, crema;

  RouteCollection = require("./routeCollection");

  RequestMiddleware = require("./middleware");

  crema = require("crema");

  module.exports = AbstractDispatcher = (function() {
    /*
    	 constructor
    */
    function AbstractDispatcher(router) {
      this.router = router;
      this._collection = new RouteCollection();
    }

    /*
    	 returns number of listeners based on channel given
    */

    AbstractDispatcher.prototype.numListeners = function(channel, ops) {
      return this._filterListeners(this._collection.getRouteListeners(channel), ops).length;
    };

    /*
    	 dispatches a request
    */

    AbstractDispatcher.prototype.dispatch = function(message) {
      var listener, listeners, messageClone, messanger, middleware, _i, _len;
      listeners = this._prepareRequest(message);
      for (_i = 0, _len = listeners.length; _i < _len; _i++) {
        listener = listeners[_i];
        messageClone = message;
        middleware = RequestMiddleware.expand(messageClone.channel, listener, this);
        messanger = this._newMessanger(messageClone, middleware);
        messanger.start();
      }
      return this;
    };

    /*
    	 adds a route listener to the collection tree
    */

    AbstractDispatcher.prototype.addRouteListener = function(route, callback) {
      route = this._prepareRoute(route);
      return this._collection.addRouteListener({
        callback: callback,
        route: route
      });
    };

    /*
    	 returns a new request
    */

    AbstractDispatcher.prototype._newMessanger = function(message, middleware) {};

    /*
    	 validates a listener to make sure it doesn't conflict with existing listeners
    */

    AbstractDispatcher.prototype._prepareRoute = function(route) {
      return route;
    };

    /*
    */

    AbstractDispatcher.prototype._findListeners = function(route, param) {
      return this._filterListeners(this._collection.getRouteListeners(route.channel, param), route.tags);
    };

    /*
    */

    AbstractDispatcher.prototype._prepareRequest = function(message) {
      return this._findListeners(message);
    };

    /*
    */

    AbstractDispatcher.prototype._filterListeners = function(listeners, tags) {
      var filtered, i, listener, tagName, tagV, value, _len;
      filtered = listeners.concat();
      for (tagName in tags) {
        value = tags[tagName];
        if (value === 1) continue;
        for (i = 0, _len = filtered.length; i < _len; i++) {
          listener = filtered[i];
          if (listener.route.tags.unfilterable) break;
          tagV = listener.route.tags[tagName];
          if ((tagV !== value) && (tagV !== "*")) {
            filtered.splice(i--, 1);
            _len--;
          }
        }
      }
      return filtered;
    };

    return AbstractDispatcher;

  })();

}).call(this);
