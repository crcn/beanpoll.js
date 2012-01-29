(function() {
  var MessageBuilder, Router, collectPlugin, crema, disposable, plugins, pullPlugin, pushPlugin, _;

  crema = require("crema");

  MessageBuilder = require("./message").Builder;

  pushPlugin = require("./push/plugin");

  pullPlugin = require("./pull/plugin");

  collectPlugin = require("./collect/plugin");

  plugins = require("./plugins");

  disposable = require("disposable");

  _ = require("underscore");

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

    Router.prototype.on = function(routeOrListeners, ops, callback) {
      var listenerDisposables, route, routes, type, _fn, _i, _len,
        _this = this;
      if (typeof ops === 'function') {
        callback = ops;
        ops = {};
      }
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
        if (ops.type) route.type = ops.type;
        if (ops.tags) _.extend(route.tags, ops.tags);
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
    */

    Router.prototype.routeExists = function(ops) {
      var type;
      if (typeof ops.channel === 'string') {
        ops.channel = crema.parseChannel(ops.channel);
      }
      if (!ops.type) {
        for (type in this.directors) {
          if (this.directors[type].routeExists(ops)) return true;
        }
      }
      return this.directors[ops.type].routeExists(ops);
    };

    /*
    */

    Router.prototype.channels = function(ops) {
      var channels, director, name;
      channels = [];
      for (name in this.directors) {
        director = this.directors[name];
        channels = channels.concat(director.channels(ops));
      }
      return channels;
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
