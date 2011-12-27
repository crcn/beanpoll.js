(function() {
  var Collection, RouteTree;

  RouteTree = (function() {
    /*
    */
    function RouteTree(path) {
      this.path = path;
      this.listeners = [];
      this._children = {};
    }

    /*
    */

    RouteTree.prototype.getChild = function(path, create) {
      if (create == null) create = false;
      if (!(path in this._children) && create) {
        return this._children[path] = new RouteTree(path);
      } else {
        return this._children[path];
      }
    };

    return RouteTree;

  })();

  module.exports = Collection = (function() {
    /*
    */
    function Collection() {
      this._children = {};
      this._tree = new RouteTree("/");
    }

    /*
    */

    Collection.prototype.addRouteListener = function(listener) {
      return this._getTree(listener.route.channel).listeners.push(listener);
    };

    /*
    */

    Collection.prototype.getRouteListeners = function(channel) {
      var tree;
      tree = this._getTree(channel, true);
      if (tree) {
        return tree.listeners;
      } else {
        return [];
      }
    };

    /*
    */

    Collection.prototype.hasRouteListener = function(channel) {
      return !!this.getRouteListeners(channel).length;
    };

    /*
    */

    Collection.prototype._getTree = function(channel, find) {
      var currentTree, newTree, path, pathName, _i, _len, _ref;
      if (find == null) find = false;
      currentTree = this._tree;
      _ref = channel.paths;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        path = _ref[_i];
        pathName = path.param ? "_param" : path.value;
        newTree = currentTree.getChild(pathName, !find);
        if (!newTree) newTree = currentTree.getChild("_param", false);
        if (!newTree) return null;
        currentTree = newTree;
      }
      return currentTree;
    };

    return Collection;

  })();

}).call(this);
