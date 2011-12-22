(function() {
  var EventEmitter, LinkedQueue,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  module.exports = LinkedQueue = (function(_super) {

    __extends(LinkedQueue, _super);

    LinkedQueue.prototype._hasNext = true;

    /*
    	 moves into the next
    */

    function LinkedQueue(first, onNext) {
      this.first = first;
      LinkedQueue.__super__.constructor.call(this);
      this.last = first.getLastSibling();
      if (onNext) this._onNext = onNext;
    }

    /*
    	 moves onto the next request (middleware)
    */

    LinkedQueue.prototype.next = function() {
      if (!this._hasNext) return false;
      this._setNext();
      this._onNext(this.current);
      return true;
    };

    /*
    	 skips middleware
    */

    LinkedQueue.prototype.skipNext = function(count) {
      if (!!this._hasNext) return false;
      while (count-- && this._hasNext) {
        this._setNext();
      }
      this._onNext(this.current);
      return true;
    };

    /*
    	 flag whether we can continue with middleware
    */

    LinkedQueue.prototype.hasNext = function() {
      return this._hasNext;
    };

    /*
    */

    LinkedQueue.prototype._setNext = function() {
      this.current = !!this.current ? this.current.getNextSibling() : this.first;
      this._hasNext = !!this.current.getNextSibling();
      if (!this._hasNext) return this.emit("queueComplete");
    };

    /*
    */

    LinkedQueue.prototype._onNext = function(middleware) {};

    return LinkedQueue;

  })(EventEmitter);

  module.exports = LinkedQueue;

}).call(this);
