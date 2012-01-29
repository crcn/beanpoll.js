(function() {
  var Director, outcome;

  Director = require("./director");

  outcome = require("outcome");

  module.exports = function(router) {
    var director;
    director = new Director("pull", router);
    return {
      name: director.name,
      /*
      */
      director: director,
      /*
      */
      newListener: function(listener) {
        if (!!listener.route.tags.pull) {
          return router.pull(listener.route.channel, null, listener.tags, outcome({
            success: listener.callback
          }));
        }
      },
      /*
      	 extend the router
      */
      router: {
        pull: function(channel, query, headers, callback) {
          return this._pull(channel, query, headers, callback, director.name);
        },
        _pull: function(channel, query, headers, callback, type) {
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
        }
      },
      /*
      	 extend the message builder
      */
      message: {
        pull: function(query, callback) {
          return this._pull(query, callback, director.name);
        },
        _pull: function(query, callback, type) {
          if (typeof query === 'function') {
            callback = query;
            query = null;
          }
          if (!!query) this.query(query);
          if (!!callback) this.response(callback);
          return this.dispatch(type);
        }
      }
    };
  };

}).call(this);
