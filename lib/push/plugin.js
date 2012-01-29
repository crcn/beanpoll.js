(function() {
  var Director;

  Director = require("./director");

  module.exports = function(router) {
    var director;
    director = new Director(router);
    return {
      name: "push",
      director: director,
      router: {
        push: function(channel, data, query, headers) {
          return this.request(channel, query, headers).push(data);
        }
      },
      message: {
        push: function(data) {
          var writer;
          writer = this.dispatch("push");
          if (!!arguments.length) writer.end(data);
          return writer;
        }
      }
    };
  };

}).call(this);
