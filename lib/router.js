(function() {
  var MessageWriter, PullDispatcher, PushDispatcher, Router, crema;

  MessageWriter = require("./message").Writer;

  crema = require("crema");

  PullDispatcher = require("./pull/dispatcher");

  PushDispatcher = require("./push/dispatcher");

  Router = (function() {
    /*
    */
    function Router() {
      this._pushDispatcher = new PushDispatcher;
      this._pullDispatcher = new PullDispatcher;
    }

    /*
    	 listens for a request
    */

    Router.prototype.on = function(routeOrListeners, callback) {
      var dispatcher, route, type, _i, _len, _ref;
      if (typeof routeOrListeners === "object") {
        for (type in routeOrListeners) {
          this.on(type, routeOrListeners[type]);
        }
        return this;
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

    Router.prototype.request = function(channel, query, headers) {
      var writer;
      writer = new MessageWriter(crema.parseChannel(channel), this);
      writer.options({
        query: query,
        headers: headers
      });
      return writer;
    };

    /*
    	 abreviated
    */

    Router.prototype.req = function() {
      return this.request.apply(this, arguments);
    };

    /*
    	 Pulls a request (1-to-1) - expects a return
    */

    Router.prototype.pull = function(channel, query, headers, callback) {
      if (typeof query === 'function') {
        callback = query;
        headers = null;
        query = null;
      }
      if (typeof headers === 'function') {
        callback = headers;
        headers = null;
      }
      return this.request(channel, query, headers).pull(callback);
    };

    /*
    	 Pushes a request (1-to-many) - NO return
    */

    Router.prototype.push = function(channel, data, query, headers) {
      return this.request(channel, query, headers).push(data);
    };

    return Router;

  })();

  module.exports = Router;

}).call(this);
