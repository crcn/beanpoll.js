(function() {
  var Director, outcome;

  Director = require("./director");

  outcome = require("outcome");

  module.exports = function(router) {
    var director;
    director = new Director("collect", router);
    return {
      name: director.name,
      director: director,
      router: {
        collect: function(channel, query, headers, callback) {
          return this._pull(channel, query, headers, callback, director.name);
        }
      },
      newListener: function(listener) {
        if (!!listener.route.tags.collect) {
          return router.request(listener.route.channel).headers(listener.route.tags).success(listener.callback).collect();
        }
      },
      request: {
        collect: function(query, callback) {
          return this._pull(query, callback, director.name);
        }
      }
    };
  };

}).call(this);
