(function() {
  var MessageReader, MessageWriter, Reader, Writer, outcome,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Reader = require("./io/reader");

  Writer = require("./io/writer");

  outcome = require("outcome");

  exports.Reader = MessageReader = (function(_super) {

    __extends(MessageReader, _super);

    /*
    	 constructor
    */

    function MessageReader(writer, from, channel, query, headers, callback) {
      this.writer = writer;
      this.from = from;
      this.channel = channel;
      this.query = query;
      this.headers = headers != null ? headers : {};
      this.callback = callback != null ? callback : null;
      MessageReader.__super__.constructor.call(this, writer);
    }

    return MessageReader;

  })(Reader);

  exports.Writer = MessageWriter = (function(_super) {

    __extends(MessageWriter, _super);

    /*
    */

    function MessageWriter(_ops) {
      this._ops = _ops;
      this.channel = _ops.channel;
      this.callback = _ops.callback;
      this.next = _ops.next;
      this.filter = _ops.filter || {};
      this.pre = _ops.pre;
      this.type = _ops.type;
      this.from = _ops.from;
      this.headers = _ops.headers;
      this.query = _ops.query;
      MessageWriter.__super__.constructor.call(this);
    }

    /*
    */

    MessageWriter.prototype.reader = function(index, numListeners) {
      return new MessageReader(this, this.from, this.channel, this.query, this.headers, this.callback);
    };

    return MessageWriter;

  })(Writer);

  exports.Builder = (function() {
    /*
    */
    function _Class(router) {
      this.router = router;
      this.clean();
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
      return this.from(this.router);
    };

    /*
    	 filterable tags
    */

    _Class.prototype.tag = function(keyOrTags, value) {
      var key;
      if (!arguments.length) return this._ops.filter;
      if (!this._ops.filter) this._ops.filter = {};
      if (typeof keyOrTags === 'string') {
        if (arguments.length === 1) return this._ops.filter[keyOrTags];
        if (typeof value === 'boolean') {
          value = {
            $exists: value
          };
        }
        this._ops.filter[keyOrTags] = value;
      } else {
        for (key in keyOrTags) {
          this.tag(key, keyOrTags[key]);
        }
      }
      return this;
    };

    /*
    	 DEPRECATED
    */

    _Class.prototype.hasListeners = function() {
      return this.exists();
    };

    /*
    */

    _Class.prototype.exists = function() {
      return !!this.router.director(this.type()).getListeners({
        channel: this._ops.channel
      }).length;
    };

    /*
    */

    _Class.prototype.type = function(value) {
      return this._param('type', arguments);
    };

    /*
    */

    _Class.prototype.from = function(value) {
      return this._param('from', arguments);
    };

    /*
    */

    _Class.prototype.to = function(value) {
      return this._param('to', arguments);
    };

    /*
    */

    _Class.prototype.channel = function(value) {
      return this._param('channel', arguments);
    };

    /* 
    	 Query would be something like ?name=craig&last=condon
    */

    _Class.prototype.query = function(value) {
      return this._param('query', arguments);
    };

    /*
    	 The header data explaining the message, such as tags, content type, etc.
    */

    _Class.prototype.headers = function(value) {
      return this._param('headers', arguments);
    };

    /*
    	 response handler, or ack
    	 deprecated
    */

    _Class.prototype.response = function(callback) {
      return this._param('response', arguments);
    };

    /*
    	 on error callback
    */

    _Class.prototype.error = function(callback) {
      return this._param('error', arguments);
    };

    /*
    	 on success callback
    */

    _Class.prototype.success = function(callback) {
      return this._param('success', arguments);
    };

    /*
    	 append middleware to the end
    */

    _Class.prototype.next = function(middleware) {
      return this._param('next', arguments);
    };

    /*
    	 prepend middleware
    */

    _Class.prototype.pre = function(middleware) {
      return this._param('pre', arguments);
    };

    /*
    */

    _Class.prototype.dispatch = function(type) {
      var writer;
      this._ops.callback = outcome({
        error: this.error(),
        success: this.success(),
        callback: this.response()
      });
      if (type) this.type(type);
      writer = new MessageWriter(this._ops);
      this.router.dispatch(writer);
      return writer;
    };

    /*
    */

    _Class.prototype._param = function(name, args) {
      if (!args.length) return this._ops[name];
      this._ops[name] = args[0];
      return this;
    };

    return _Class;

  })();

}).call(this);
