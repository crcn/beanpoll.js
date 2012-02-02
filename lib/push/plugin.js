(function() {
  var Director;

  Director = require("./director");

  module.exports = function(router) {
    var director;
    director = new Director("push", router);
    return {
      name: director.name,
      director: director,
      router: {
        push: function(channel, query, headers) {
          return this.request(channel, query, headers).push(null);
        }
      },
      message: {
        push: function(data) {
          var writer;
          writer = this.dispatch(director.name);
          if (!!arguments.length) writer.end(data);
          return writer;
        }
      }
    };
  };

}).call(this);
