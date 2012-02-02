(function() {
  var Messenger, RequestMiddleware, crema, dolce;

  dolce = require("dolce");

  RequestMiddleware = require("./middleware");

  crema = require("crema");

  Messenger = require("./messenger");

  /*
  
  Director process:
  */

  module.exports = (function() {
    /*
    	 some directors are passive, meaning errors aren't returned if a route does not exist. This goes for collectors,
    	 emitters, etc.
    */
    _Class.prototype.passive = false;

    /*
    	 constructor
    */

    function _Class(name, router) {
      this.name = name;
      this.router = router;
      this._collection = dolce.collection();
    }

    /*
    	 returns number of listeners based on channel given
    */

    _Class.prototype.numListeners = function(channel, ops) {
      return this._collection.get(channel, ops).chains.length;
    };

    /*
    	 dispatches a request
    */

    _Class.prototype.dispatch = function(messageWriter) {
      var chain, chains, messageReader, messanger, middleware, numChains, numRunning, oldAck, _i, _len;
      chains = this.getListeners(messageWriter);
      numChains = chains.length;
      numRunning = numChains;
      oldAck = messageWriter.callback;
      messageWriter.running = !!numChains;
      messageWriter.callback = function() {
        messageWriter.running = !!(--numRunning);
        if (oldAck) {
          return oldAck.apply(this, Array.apply(null, arguments).concat([numRunning, numChains]));
        }
      };
      if (!!!chains.length && !this.passive) {
        messageWriter.callback(new Error("Route \"" + (crema.stringifyPaths(messageWriter.channel.paths)) + "\" does not exist"));
        return this;
      }
      for (_i = 0, _len = chains.length; _i < _len; _i++) {
        chain = chains[_i];
        messageReader = messageWriter.reader();
        middleware = RequestMiddleware.wrap(chain, messageWriter.pre, messageWriter.next, this);
        messanger = this._newMessenger(messageReader, middleware);
        messanger.start();
      }
      return this;
    };

    /*
    	 adds a route listener to the collection tree
    */

    _Class.prototype.addListener = function(route, callback) {
      disposable;
      var disposable, oldCallback;
      if (route.tags.one) {
        oldCallback = callback;
        callback = function() {
          oldCallback.apply(this, arguments);
          return disposable.dispose();
        };
      }
      this._validateListener(route, callback);
      return disposable = this._collection.add(route, callback);
    };

    /*
    */

    _Class.prototype.channels = function(ops) {
      var channels, listener, _i, _len, _ref, _results;
      channels = [];
      _ref = this._collection.find(ops);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        _results.push({
          tags: listener.tags,
          type: this.name,
          path: listener.path
        });
      }
      return _results;
    };

    /*
    */

    _Class.prototype.listenerQuery = function(ops) {
      var search, tag, tagName, tags;
      tags = [];
      tag = {};
      for (tagName in ops.tags) {
        if (ops.tags[tagName] === true) {
          ops.tags[tagName] = {
            $exists: true
          };
        }
        tag = {};
        tag[tagName] = ops.tags[tagName];
        tags.push(tag);
      }
      search = {
        $or: [
          {
            $and: tags
          }, {
            unfilterable: {
              $exists: true
            }
          }
        ]
      };
      return search;
    };

    /*
    */

    _Class.prototype.getListeners = function(route, search) {
      return this._collection.get(route.channel, {
        siftTags: this.listenerQuery(search || route)
      }).chains;
    };

    /*
    */

    _Class.prototype.routeExists = function(route) {
      return this._collection.contains(route.channel, {
        siftTags: this.listenerQuery(route)
      });
    };

    /*
    	 returns a new request
    */

    _Class.prototype._newMessenger = function(message, middleware) {
      return new Messenger(message, middleware, this);
    };

    /*
    */

    _Class.prototype._validateListener = function(route) {
      var listeners;
      if (this.passive) return;
      listeners = this._collection.get(route.channel, route.tags);
      if (!!listeners.length) {
        throw new Error("Route \"" + route.channel.value + "\" already exists");
      }
    };

    return _Class;

  })();

}).call(this);
