(function() {
  var Message, Reader, Writer,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Reader = require("./io/reader");

  Writer = require("./io/writer");

  Message = (function(_super) {

    __extends(Message, _super);

    /*
    	 constructor
    */

    function Message(writer, channel, query, headers, callback) {
      this.channel = channel;
      this.query = query != null ? query : {};
      this.headers = headers != null ? headers : {};
      this.callback = callback;
      Message.__super__.constructor.call(this, writer);
    }

    return Message;

  })(Reader);

  exports.Writer = (function(_super) {

    __extends(_Class, _super);

    /*
    */

    function _Class(channel, router, _ops) {
      this.channel = channel;
      this.router = router;
      this._ops = _ops;
      _Class.__super__.constructor.call(this);
    }

    /*
    */

    _Class.prototype.prepare = function(channel, router, _ops) {
      this.channel = channel;
      this.router = router;
      this._ops = _ops;
      return this;
    };

    /*
    	 options which control how the request
    	 is handled
    */

    _Class.prototype.options = function(value) {
      if (!arguments.length) return this._ops;
      this._ops = value || {};
      return this;
    };

    /*
    */

    _Class.prototype.query = function(value) {
      if (!arguments.length) return this._ops.query;
      this._ops.query = value || {};
      return this;
    };

    /*
    */

    _Class.prototype.headers = function(value) {
      if (!arguments.length) return this._ops.headers;
      this._ops.headers = value || {};
      return this;
    };

    /*
    	 response handler for pull requests
    */

    _Class.prototype.response = function(callback) {
      if (!arguments.length) return this._ops.callback;
      this._ops.callback = callback;
      return this;
    };

    /*
    */

    _Class.prototype.pull = function(query, callback) {
      var msg;
      if (typeof query === 'function') {
        callback = query;
        query = null;
      }
      if (!!query) this.query(query);
      if (!!callback) this.response(callback);
      msg = this._newReader();
      this.router._pullDispatcher.dispatch(msg);
      return this;
    };

    /*
    */

    _Class.prototype.push = function(query) {
      var msg;
      if (!!query) this.query(query);
      msg = this._newReader();
      this.router._pushDispatcher.dispatch(msg);
      return this;
    };

    /*
    */

    _Class.prototype._newReader = function() {
      return new Message(this, this.channel, this._ops.query, this._ops.headers, this._ops.callback);
    };

    return _Class;

  })(Writer);

}).call(this);
