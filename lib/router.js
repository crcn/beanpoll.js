(function() {
  var Message, PullDispatcher, PushDispatcher, Router, crema;

  Message = require("./message");

  crema = require("crema");

  PullDispatcher = require("./pull/dispatcher");

  PushDispatcher = require("./push/dispatcher");

  Router = (function() {

    function Router() {}

    /*
    */

    constructor(function() {
      this._pushDispatcher = new PushDispatcher;
      return this._pullDispatcher = new PullDispatcher;
    });

    /*
    	 listens for a request
    */

    Router.prototype.on = function(routeOrListeners, callback) {
      var dispatcher, route, type, _i, _len, _ref;
      if (typeof routeOrListeners === "object") {
        for (type in routeOrListeners) {
          this.on(type, routeOrListeners[type]);
        }
        this;
      }
      _ref = crema(routeOrListeners);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        dispatcher = route.type === "pull" ? this._pullDispatcher : this._pushDispatcher;
        dispatcher.addRouteListener(route, callback);
      }
      return this;
    };

    /*
    	 Initializes a new request
    */

    Router.prototype.request = function(channelOrMessage, query, headers) {
      var message;
      message = messageOrChannel instanceof Message ? messageOrChannel : new Message(channelOrMessage, this);
      message.options({
        query: query,
        headers: headers
      });
      return message;
    };

    /*
    	 Pulls a request (1-to-1) - expects a return
    */

    Router.prototype.pull = function(channelOrMessage, query, headers, callback) {
      if (typeof query === 'function') {
        callback = query;
        headers = null;
        query = null;
      }
      if (typeof headers === 'function') {
        callback = headers;
        headers = null;
      }
      return this.request(channelOrMessage, query, headers).pull(callback);
    };

    /*
    	 Pushes a request (1-to-many) - NO return
    */

    Router.prototype.push = function(channelOrMessage, query, headers) {
      return this.request(channelOrMessage, query, headers).push();
    };

    return Router;

  })();

  module.exports = Router;

}).call(this);
