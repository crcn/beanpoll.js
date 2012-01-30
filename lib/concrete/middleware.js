(function() {
  var LinkedList, Middleware,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  LinkedList = require("../collections/linkedList");

  module.exports = Middleware = (function(_super) {

    __extends(Middleware, _super);

    /*
    	 constructor
    */

    function Middleware(item, director) {
      this.director = director;
      this.listener = item.value;
      this.channel = {
        paths: item.paths
      };
      this.params = item.params;
      this.tags = item.tags;
      this.path = item.path;
    }

    return Middleware;

  })(LinkedList);

  /*
   Wraps the chained callbacks in middleware
  */

  Middleware.wrap = function(chain, next, director) {
    var current, item, prev, _i, _len;
    for (_i = 0, _len = chain.length; _i < _len; _i++) {
      item = chain[_i];
      current = new Middleware(item, director);
      if (prev) current.addPrevSibling(prev, true);
      prev = current;
    }
    if (typeof next === 'function') {
      current.addNextSibling(new Middleware({
        value: next,
        params: {},
        tags: {},
        channel: {
          paths: []
        }
      }));
    }
    return current.getFirstSibling();
  };

}).call(this);
