(function() {
  var Pool;

  module.exports = Pool = (function() {
    /*
    */
    function Pool(clazz, maxSize) {
      this.clazz = clazz;
      this.maxSize = maxSize != null ? maxSize : 10;
      this.pool = [];
    }

    /*
    */

    Pool.prototype.push = function(obj) {
      if (this.pool.length < this.maxSize) {
        this.pool.push(obj);
        return obj.clean();
      }
    };

    /*
    */

    Pool.prototype.pop = function() {
      if (this.pool.length) {
        return this.pool.pop();
      } else {
        return new this.clazz;
      }
    };

    /*
    */

    Pool.prototype.empty = function() {
      return !this.pool.length;
    };

    return Pool;

  })();

  Pool.poolable = function(clazz) {
    var pool,
      _this = this;
    pool = clazz.pool = new Pool(clazz);
    return clazz.create = function() {
      return pool.pop();
    };
  };

}).call(this);
