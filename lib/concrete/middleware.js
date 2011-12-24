(function() {
  var LinkedList, Middleware,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  LinkedList = require("../collections/linkedList");

  module.exports = Middleware = (function(_super) {

    __extends(Middleware, _super);

    /*
    	 constructor
    */

    function Middleware(channel, listener) {
      this.channel = channel;
      this.listener = listener;
    }

    return Middleware;

  })(LinkedList);

  Middleware.expand = function(channel, listener, dispatcher) {
    var current, currentMiddleware, last, middleware, mw, _i, _len;
    currentMiddleware = listener.route.thru;
    last = current = new Middleware(channel, listener);
    while (!!currentMiddleware) {
      middleware = dispatcher._collection.getRouteListeners(currentMiddleware.channel);
      for (_i = 0, _len = middleware.length; _i < _len; _i++) {
        mw = middleware[_i];
        current = Middleware.expand(currentMiddleware.channel, mw, dispatcher);
        last.addPrevSibling(current.getLastSibling());
        last = current.getFirstSibling();
      }
      currentMiddleware = currentMiddleware.thru;
    }
    return last.getFirstSibling();
  };

}).call(this);
