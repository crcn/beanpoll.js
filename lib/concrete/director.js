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
    	 constructor
    */
    function _Class(router) {
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
          return oldAck.apply(this, Array.prototype.concat.apply([], arguments, [numRunning, numChains]));
        }
      };
      for (_i = 0, _len = chains.length; _i < _len; _i++) {
        chain = chains[_i];
        messageReader = messageWriter.reader();
        middleware = RequestMiddleware.wrap(chain, this);
        messanger = this._newMessenger(messageReader, middleware);
        messanger.start();
      }
      return this;
    };

    /*
    	 adds a route listener to the collection tree
    */

    _Class.prototype.addListener = function(route, callback) {
      return this._collection.add(route, callback);
    };

    /*
    	 adds a route listener to the collection tree
    */

    _Class.prototype.hasListeners = function(route) {
      return this.getListeners(route).length;
    };

    /*
    */

    _Class.prototype.getListeners = function(route) {
      return this._collection.get(route.channel, {
        tags: route.tags
      }).chains;
    };

    /*
    	 returns a new request
    */

    _Class.prototype._newMessenger = function(message, middleware) {
      return new Messenger(message, middleware, this);
    };

    return _Class;

  })();

}).call(this);
