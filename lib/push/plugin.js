(function() {
  var Director;

  Director = require("./director");

  module.exports = function(router) {
    /*
    */
    var director;
    director = new Director("push", router);
    return {
      /*
      */
      name: director.name,
      /*
      */
      director: director,
      /*
      */
      newListener: function(listener) {
        return router.request('new/listener').tag('private', true).query(listener).push();
      },
      /*
      */
      router: {
        push: function(channel, query, headers) {
          return this.request(channel, query, headers).push(null);
        }
      },
      /*
      */
      request: {
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
