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
        push: function(channel, data, query, headers) {
          return this.request(channel, query, headers).push(data);
        }
      },
      message: {
        push: function(data) {
          var writer;
          if (!this.error()) this.error(function() {});
          writer = this.dispatch(director.name);
          if (!!arguments.length) writer.end(data);
          return writer;
        }
      }
    };
  };

}).call(this);
