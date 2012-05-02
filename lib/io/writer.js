(function() {
  var Reader, Stream, Writer,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Stream = require("stream").Stream;

  Reader = require("./reader");

  module.exports = Writer = (function(_super) {

    __extends(Writer, _super);

    Writer.name = 'Writer';

    function Writer() {
      var _this = this;
      Writer.__super__.constructor.call(this);
      this._paused = false;
      this.setMaxListeners(0);
      this.on("pipe", function(src) {
        _this._source = src;
        console.log(_this._paused);
        if (_this._paused) return _this._source.pause();
      });
    }

    /*
    */

    Writer.prototype.error = function(err) {
      if (typeof err === 'string') err = new Error(err);
      return this.emit("error", err);
    };

    /*
    */

    Writer.prototype.write = function(chunk, encoding) {
      if (encoding == null) encoding = "utf8";
      if (this._paused) return false;
      return this.emit("data", chunk, encoding);
    };

    /*
    */

    Writer.prototype.end = function(chunk, encoding) {
      if (chunk) this.write(chunk, encoding);
      if (this.ended) throw new Error("Cannot call end twice");
      this.ended = true;
      this.emit("end");
      return this;
    };

    /*
    */

    Writer.prototype.pause = function() {
      var _ref;
      this._paused = true;
      return (_ref = this._source) != null ? typeof _ref.pause === "function" ? _ref.pause() : void 0 : void 0;
    };

    /*
    */

    Writer.prototype.resume = function() {
      var _ref;
      this._paused = false;
      return (_ref = this._source) != null ? typeof _ref.resume === "function" ? _ref.resume() : void 0 : void 0;
    };

    /*
    */

    Writer.prototype.destroy = function() {};

    /*
    */

    Writer.prototype.reader = function() {
      return new Reader(this);
    };

    return Writer;

  })(Stream);

  Writer.prototype.writable = true;

}).call(this);
