(function() {
  var Director, outcome;

  Director = require("./director");

  outcome = require("outcome");

  module.exports = function(router) {
    var director;
    director = new Director(router);
    return {
      name: "collect",
      director: director,
      router: {
        collect: function(channel, query, headers, callback) {
          return this._pull(channel, query, headers, callback, "collect");
        }
      },
      newListener: function(listener) {
        if (!!listener.route.tags.collect) {
          return router.collect(listener.route.channel, null, listener.tags, outcome({
            success: listener.callback
          }));
        }
      },
      message: {
        collect: function(query, callback) {
          return this._pull(query, callback, 'collect');
        }
      }
    };
  };

}).call(this);
