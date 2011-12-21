(function() {
  var AbstractDispatcher, RequestMiddleware, RouteCollection, crema;

  RouteCollection = require("./routeCollection");

  RequestMiddleware = require("./request/middleware");

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
    	 dispatches a request
    */

    AbstractDispatcher.prototype.dispatch = function(message) {
      var listener, listeners, messageClone, middleware, request, _i, _len;
      listeners = this._collection.getRouteListeners(message.channel);
      for (_i = 0, _len = listeners.length; _i < _len; _i++) {
        listener = listeners[_i];
        messageClone = message.clone();
        middleware = RequestMiddleware.prototype.expand(messageClone.channel, listener, this);
        request = this._newMessanger(messageClone, middleware);
        request.next();
      }
      return this;
    };

    /*
    	 adds a route listener to the collection tree
    */

    AbstractDispatcher.prototype.addRouteListener = function(route, listener) {
      route = this._prepareRoute(route);
      listener.route = route;
      return this._collection.addRouteListener(listener);
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

    return AbstractDispatcher;

  })();

}).call(this);
