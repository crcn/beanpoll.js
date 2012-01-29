(function() {
  var MessageReader, MessageWriter, Reader, Writer,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Reader = require("./io/reader");

  Writer = require("./io/writer");

  MessageReader = (function(_super) {

    __extends(MessageReader, _super);

    /*
    	 constructor
    */

    function MessageReader(writer, channel, query, headers, tags, callback) {
      this.writer = writer;
      this.channel = channel;
      this.query = query != null ? query : {};
      this.headers = headers != null ? headers : {};
      this.tags = tags != null ? tags : {};
      this.callback = callback;
      MessageReader.__super__.constructor.call(this, writer);
    }

    return MessageReader;

  })(Reader);

  MessageWriter = (function(_super) {

    __extends(MessageWriter, _super);

    /*
    */

    function MessageWriter(_ops) {
      this._ops = _ops;
      this.channel = _ops.channel;
      this.tags = _ops.tags;
      this.callback = _ops.callback;
      MessageWriter.__super__.constructor.call(this);
    }

    /*
    */

    MessageWriter.prototype.reader = function(index, numListeners) {
      return new MessageReader(this, this.channel, this._ops.query, this._ops.headers, this.tags, this.callback);
    };

    return MessageWriter;

  })(Writer);

  exports.Builder = (function() {
    /*
    */
    function _Class(router) {
      this.router = router;
    }

    /*
    	 options which control how the request
    	 is handled. This can fill out the entire request vs using the methods given
    */

    _Class.prototype.options = function(value) {
      if (!arguments.length) return this._ops;
      this._ops = value || {};
      return this;
    };

    /*
    */

    _Class.prototype.clean = function() {
      this._ops = {};
      return this;
    };

    /*
    	 filterable tags
    */

    _Class.prototype.tag = function(key, value) {
      if (!arguments.length) return this._ops.tags;
      if (typeof key === 'string') {
        if (arguments.length === 1) return this._ops.tags[key];
        this._ops.tags[key] = value;
      } else {
        this._ops.tags = key || {};
      }
      return this;
    };

    /*
    */

    _Class.prototype.hasListeners = function() {
      return this.director.hasListeners({
        channel: this._ops.channel,
        tags: this._ops.tags
      });
    };

    _Class.prototype.type = function(value) {
      if (!arguments.length) return this._ops.type;
      this._ops.type = value || {};
      this.director = this.router.directors[value];
      if (!this.director) throw new Error("type " + value + " does not exist");
      return this;
    };

    /*
    */

    _Class.prototype.channel = function(value) {
      if (!arguments.length) return this._ops.channel;
      this._ops.channel = value || {};
      return this;
    };

    /* 
    	 Query would be something like ?name=craig&last=condon
    */

    _Class.prototype.query = function(value) {
      if (!arguments.length) return this._ops.query;
      this._ops.query = value || {};
      return this;
    };

    /*
    	 The header data explaining the message, such as tags, content type, etc.
    */

    _Class.prototype.headers = function(value) {
      if (!arguments.length) return this._ops.headers;
      this._ops.headers = value || {};
      return this;
    };

    /*
    	 response handler, or ack
    	 deprecated
    */

    _Class.prototype.response = function(callback) {
      if (!arguments.length) return this._ops.callback;
      this._ops.callback = callback;
      return this;
    };

    /*
    */

    _Class.prototype.dispatch = function(type) {
      var writer;
      if (type) this.type(type);
      writer = new MessageWriter(this._ops);
      this.director.dispatch(writer);
      return writer;
    };

    return _Class;

  })();

}).call(this);
