(function() {
  var CollectDispatcher, MessageWriter, PullDispatcher, PushDispatcher, Router, crema;

  MessageWriter = require("./message").Writer;

  crema = require("crema");

  PullDispatcher = require("./pull/dispatcher");

  PushDispatcher = require("./push/dispatcher");

  CollectDispatcher = require("./collect/dispatcher");

  Router = (function() {
    /*
    */
    function Router() {
      this._dispatchers = {
        pull: new PullDispatcher,
        push: new PushDispatcher,
        collect: new CollectDispatcher
      };
    }

    /*
    	 listens for a request
    */

    Router.prototype.on = function(routeOrListeners, callback) {
      var route, type, _fn, _i, _len, _ref,
        _this = this;
      if (typeof routeOrListeners === "object") {
        for (type in routeOrListeners) {
          this.on(type, routeOrListeners[type]);
        }
        return this;
      }
      _ref = crema(routeOrListeners);
      _fn = function(route) {
        _this._dispatchers[route.type].addRouteListener(route, callback);
        if (route.tags.collect || route.tags.pull) {
          return _this.request(route.channel)[route.tags.collect ? 'collect' : 'pull'](function(err, response) {
            return callback(response);
          });
        }
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        _fn(route);
      }
      return this;
    };

    /*
    	 Initializes a new request
    */

    Router.prototype.request = function(channel, query, headers) {
      var writer;
      writer = new MessageWriter((typeof channel === "string" ? crema.parseChannel(channel) : channel), this);
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
      return this._pull(channel, query, headers, callback, "pull");
    };

    /*
    */

    Router.prototype.collect = function(channel, query, headers, callback) {
      return this._pull(channel, query, headers, callback, "collect");
    };

    /*
    	 Pushes a request (1-to-many) - NO return
    */

    Router.prototype.push = function(channel, data, query, headers) {
      return this.request(channel, query, headers).push(data);
    };

    /*
    */

    Router.prototype._pull = function(channel, query, headers, callback, type) {
      if (typeof query === 'function') {
        callback = query;
        headers = null;
        query = null;
      }
      if (typeof headers === 'function') {
        callback = headers;
        headers = null;
      }
      return this.request(channel, query, headers)[type](callback);
    };

    return Router;

  })();

  module.exports = Router;

}).call(this);
