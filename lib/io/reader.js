(function() {
  var Reader, Stream,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Stream = require("stream").Stream;

  module.exports = Reader = (function(_super) {

    __extends(Reader, _super);

    /*
    */

    function Reader(source, ops) {
      var _this = this;
      this.source = source;
      Reader.__super__.constructor.call(this);
      this.setMaxListeners(0);
      if (source) {
        source.on("data", function(data) {
          return _this.emit("data", data);
        });
        source.on("end", function(data) {
          return _this.emit("end");
        });
        source.on("error", function(err) {
          return _this.emit("error", err);
        });
      }
      if (ops && ops.cache) {
        this.cache(true);
        this.dump();
      }
      this._buffer = [];
      this.on("data", function(data) {
        if (!_this._cache) return;
        return _this._buffer.push(data);
      });
      this.on("end", function() {
        return _this.ended = true;
      });
      this.on("pipe", function(source) {
        return _this.source = source;
      });
    }

    /*
    */

    Reader.prototype.setEncoding = function(encoding) {
      var _ref;
      return (_ref = this.source) != null ? _ref.setEncoding(encoding) : void 0;
    };

    /*
    */

    Reader.prototype.pause = function() {
      var _ref;
      return (_ref = this.source) != null ? typeof _ref.pause === "function" ? _ref.pause() : void 0 : void 0;
    };

    /*
    */

    Reader.prototype.resume = function() {
      var _ref;
      return (_ref = this.source) != null ? typeof _ref.resume === "function" ? _ref.resume() : void 0 : void 0;
    };

    /*
    */

    Reader.prototype.destroy = function() {
      var _ref;
      return (_ref = this.source) != null ? typeof _ref.destroy === "function" ? _ref.destroy() : void 0 : void 0;
    };

    /*
    */

    Reader.prototype.destroySoon = function() {
      var _ref;
      return (_ref = this.source) != null ? typeof _ref.destroySoon === "function" ? _ref.destroySoon() : void 0 : void 0;
    };

    /*
    	 flags the reader that data should be cached as it's coming in.
    */

    Reader.prototype.cache = function(value) {
      if (arguments.length) this._cache = value || !!this._buffer.length;
      return this._cache;
    };

    /*
     	 listens on a reader, and pipes it to a callback a few ways
    */

    Reader.prototype.dump = function(callback, ops) {
      var buffer, chunk, listeners, onEnd, pipedStream, _i, _len, _ref,
        _this = this;
      if (!ops) ops = {};
      if (typeof callback === 'object') {
        ops.stream = true;
        listeners = callback;
        callback = function(stream) {
          var type, _results;
          _results = [];
          for (type in listeners) {
            _results.push(stream.on(type, listeners[type]));
          }
          return _results;
        };
      }
      pipedStream = ops.stream ? new Reader(this) : this;
      if (ops.stream) {
        callback.call(this, pipedStream);
        if (!this._cache) return;
      }
      buffer = [];
      onEnd = function(err) {
        var chunk, _i, _len, _results;
        if (err || ops.stream) return null;
        if (ops.batch) return callback.call(_this, err, buffer);
        if (!buffer.length) return callback();
        if (ops.each) {
          _results = [];
          for (_i = 0, _len = buffer.length; _i < _len; _i++) {
            chunk = buffer[_i];
            _results.push(callback.call(_this, err, chunk));
          }
          return _results;
        } else {
          return callback.call(_this, err, buffer.length > 1 ? buffer : buffer[0]);
        }
      };
      this.on("data", function(chunk) {
        return buffer.push(chunk);
      });
      this.on("end", onEnd);
      this.on("error", onEnd);
      if (this._buffer) {
        _ref = this._buffer;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          chunk = _ref[_i];
          if (ops.stream) pipedStream.emit("data", chunk);
          buffer.push(chunk);
        }
      }
      if (this.ended) {
        if (ops.stream) {
          return pipedStream.emit("end");
        } else {
          return onEnd(false);
        }
      }
    };

    return Reader;

  })(Stream);

  Reader.prototype.readable = true;

}).call(this);