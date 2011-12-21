(function() {
  var Reader, Stream,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Stream = require("stream").Stream;

  Reader = require("reader");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    /*
    */

    function _Class() {
      this._headers = {};
      this.pipe(this.reader = new Reader());
    }

    /*
    */

    _Class.prototype.headers = function(typeOrObj, value) {
      if (typeof typeOrObj === "object") {
        return _.extend(this._headers(typeOrObj));
      } else {
        return this._headers[typeOfObj] = value;
      }
    };

    /*
    */

    _Class.prototype.write = function(chunk, encoding) {
      if (encoding == null) encoding = "utf8";
      this.sendHeaders;
      return this.emit(chunk, encoding);
    };

    /*
    */

    _Class.prototype.end = function(chunk, encoding) {
      if (chunk) this.write(chunk, encoding);
      return this;
    };

    /*
    */

    _Class.prototype.sendHeaders = function() {
      if (this._headersSent) return;
      this._headersSent = true;
      return this.emit("headers", headers);
    };

    return _Class;

  })(Stream);

  Writer.prototype.writable = true;

}).call(this);
