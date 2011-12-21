(function() {
  var Reader,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Reader = require("./reader");

  module.exports = new ((function(_super) {

    __extends(_Class, _super);

    /*
    	 constructor
    */

    function _Class(channel, router, options) {
      this.channel = channel;
      this.router = router;
      this.options = options;
      if (_options) {
        this.headers = _options.headers;
        this.query = _options.query;
        this.source = _options.source;
        this.destination = _options.destination;
      }
      _Class.__super__.constructor.call(this);
    }

    /*
    	 options which control how the request
    	 is handled
    */

    _Class.prototype.options = function(value) {
      if (!!arguments.length) {
        this._options = value || {};
        return this;
      }
      return this._options;
    };

    /*
    	 pulls the given request (1-to-1)
    */

    _Class.prototype.pull = function(data, callback) {
      return this;
    };

    /*
    	 pushes a response out (1-to-many)
    */

    _Class.prototype.push = function(data) {
      return this;
    };

    return _Class;

  })(Reader));

  module.exports.prototype.readable = module.exports.prototype.writable = true;

}).call(this);
