(function() {
  var Response, Writer, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Writer = require("../io/writer");

  _ = require("underscore");

  module.exports = Response = (function(_super) {

    __extends(Response, _super);

    /*
    */

    function Response(_messanger) {
      this._messanger = _messanger;
      Response.__super__.constructor.call(this);
      this._headers = {};
    }

    /*
    */

    Response.prototype.headers = function(typeOrObj, value) {
      if (typeof typeOrObj === "object") {
        return _.extend(this._headers(typeOrObj));
      } else {
        return this._headers[typeOfObj] = value;
      }
    };

    /*
    */

    Response.prototype.write = function(chunk, encoding) {
      if (encoding == null) encoding = "utf8";
      this.sendHeaders();
      return Response.__super__.write.call(this, chunk, encoding);
    };

    /*
    */

    Response.prototype.end = function(chunk, encoding) {
      if (encoding == null) encoding = "utf8";
      this.sendHeaders();
      return Response.__super__.end.call(this, chunk, encoding);
    };

    /*
    */

    Response.prototype.sendHeaders = function() {
      if (this.sentHeaders) return this;
      this.sentHeaders = true;
      this.emit("headers", this.headers);
      return this;
    };

    return Response;

  })(Writer);

  Writer.prototype.writable = true;

}).call(this);
