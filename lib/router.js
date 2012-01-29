(function() {
  var MessageBuilder, Router, collectPlugin, crema, disposable, plugins, pullPlugin, pushPlugin;

  crema = require("crema");

  MessageBuilder = require("./message").Builder;

  pushPlugin = require("./push/plugin");

  pullPlugin = require("./pull/plugin");

  collectPlugin = require("./collect/plugin");

  plugins = require("./plugins");

  disposable = require("disposable");

  Router = (function() {
    /*
    */
    function Router() {
      this.directors = {};
      this._messageBuilder = new MessageBuilder(this);
      this._plugins = new plugins(this);
      this.use(pushPlugin);
      this.use(pullPlugin);
      this.use(collectPlugin);
    }

    /*
    	 uses a dispatcher
    */

    Router.prototype.use = function(plugin) {
      return this._plugins.add(plugin);
    };

    /*
    	 listens for a request
    */

    Router.prototype.on = function(routeOrListeners, callback) {
      var listenerDisposables, route, routes, type, _fn, _i, _len,
        _this = this;
      listenerDisposables = disposable.create();
      if (typeof routeOrListeners === "object" && !callback) {
        for (type in routeOrListeners) {
          listenerDisposables.add(this.on(type, routeOrListeners[type]));
        }
        return listenerDisposables;
      }
      if (typeof routeOrListeners === "string") {
        routes = crema(routeOrListeners);
      } else if (routeOrListeners instanceof Array) {
        routes = routeOrListeners;
      } else {
        routes = [routeOrListeners];
      }
      _fn = function(route) {
        listenerDisposables.add(_this.directors[route.type].addListener(route, callback));
        return _this._plugins.newListener({
          route: route,
          callback: callback
        });
      };
      for (_i = 0, _len = routes.length; _i < _len; _i++) {
        route = routes[_i];
        _fn(route);
      }
      return listenerDisposables;
    };

    /*
    	 abreviated
    */

    Router.prototype.req = function() {
      return this.request.apply(this, arguments);
    };

    /*
    	 Initializes a new request
    */

    Router.prototype.request = function(channel, query, headers) {
      return this._messageBuilder.clean().channel(typeof channel === "string" ? crema.parseChannel(channel) : channel).query(query).headers(headers);
    };

    return Router;

  })();

  module.exports = Router;

}).call(this);
