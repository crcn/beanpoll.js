var __app = (function(){

	var mesh = {
		buildId: 'a65afcf9'
	};

	


if(!Object.keys) Object.keys = function(obj) {
	var keys = [];
	for(var key in obj) {
		keys.push(key);
	}
	return keys;
}


if(!Date.now) Date.now = function() {
	return new Date().getTime();
}


if(!Array.isArray) Array.isArray = function(target) {
	return target instanceof Array;
}

// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
    Function.prototype.bind= function(owner) {
        var that= this;
        if (arguments.length<=1) {
            return function() {
                return that.apply(owner, arguments);
            };
        } else {
            var args= Array.prototype.slice.call(arguments, 1);
            return function() {
                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
    String.prototype.trim= function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}

var _sardines = (function()
{
	var nodeRequire,
	allFiles = {};

	var moduleDoesntExist = function(path)
	{
		throw new Error('Module '+ path + ' does not exist');
	}


	if(typeof require == 'undefined')
	{
		nodeRequire = function(path)
		{
			moduleDoesntExist(path);
		}


		nodeRequire.resolve = moduleDoesntExist;
	}
	else
	{
		nodeRequire = require;
	}

	var register = function(path, moduleFactory)
	{

		path = normalizePath(path);
		addPathToTree(path);

		_sardines.moduleFactories[path] = moduleFactory,
		dir = dirname(path);

		return moduleFactory;
	}

	var addPathToTree = function(path) {

		var curTree = allFiles, prevTree = allFiles,
		parts = path.split('/'),
		part;

		for(var i = 0, n = parts.length; i < n; i++) {
			part = parts[i];
			if(!curTree[part]) curTree[part] = { };
			curTree = curTree[part];
		}
	}

	var dirname = function(path)
	{
		var pathParts = path.split('/');
		pathParts.pop();
		return pathParts.join('/');
	}



	var req = function(path, cwd)
	{
		var fullPath = req.resolve(path, cwd ? cwd : '/');

		if(_sardines.modules[fullPath]) return _sardines.modules[fullPath];

		var factory = _sardines.moduleFactories[fullPath];

		if(!factory)
		{
			//could be a core function - try it.
			if(typeof require != 'undefined') return nodeRequire(path);

			moduleDoesntExist(fullPath);
		}

		var module = { exports: { } };

		var cwd = fullPath.match(/\.js$/) ? dirname(fullPath) : fullPath,
		modRequire = function(path)
		{
			return req(path, cwd);
		}

		modRequire.resolve = req.resolve;
		modRequire.paths = [];

		factory(modRequire, module, module.exports, cwd, fullPath);

		return _sardines.modules[fullPath] = module.exports;
	}

	function normalizeArray(v, keepBlanks) {
		var L = v.length,
		dst = new Array(L),
		dsti = 0,
		i = 0,
		part, negatives = 0,
		isRelative = (L && v[0] !== '');
		for (; i < L; ++i) {
			part = v[i];
			if (part === '..') {
				if (dsti > 1) {
					--dsti;
				} else if (isRelative) {
					++negatives;
				} else {
					dst[0] = '';
				}
			} else if (part !== '.' && (dsti === 0 || keepBlanks || part !== '')) {
				dst[dsti++] = part;
			}
		}
		if (negatives) {
			dst[--negatives] = dst[dsti - 1];
			dsti = negatives + 1;
			while (negatives--) {
				dst[negatives] = '..';
			}
		}
		dst.length = dsti;
		return dst;
	}

	function normalizePath(path) {
		return normalizeArray(path.split("/"), false).join("/");
	}

	function relateToAbsPath(path, cwd)
	{
		//root
		if(path.substr(0, 1) == '/') return path;

		//relative
		if(path.substr(0, 1) == '.') return cwd + '/' + path;

		return path;
	}

	function findModulePath(path)
	{
		var tryPaths = [path, path + '/index.js', path + '.js'],
		modulePaths = ['modules',''];


		for(var j = modulePaths.length; j--;)
		{
			for(var i = tryPaths.length; i--;)
			{
				var fullPath = normalizePath('/'+modulePaths[j]+'/'+tryPaths[i]);
				
				if(_sardines.moduleFactories[fullPath]) return fullPath;
			}
		}		
	}

	req.resolve = function(path, cwd)
	{
		return findModulePath(normalizePath(relateToAbsPath(path, cwd))) || nodeRequire.resolve(path);
	}

	return {
		allFiles: allFiles,
		moduleFactories: { },
		modules: { },
		require: req,
		register: register
	}
})();

_sardines.register("/modules/beanpoll/lib/index.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Router;

  Router = require("./router");

  exports.Messenger = require("./concrete/messenger");

  exports.Director = require("./concrete/director");

  exports.Request = require("./request");

  exports.Response = require("./concrete/response");

  exports.router = function() {
    return new Router();
  };

}).call(this);

});

_sardines.register("/modules/beanpoll", function(require, module, exports, __dirname, __filename) {
	module.exports = require('modules/beanpoll/lib/index.js');
});

_sardines.register("/modules/beanpoll/lib/router.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var RequestBuilder, Router, collectPlugin, crema, disposable, plugins, pullPlugin, pushPlugin, _;

  crema = require("crema");

  RequestBuilder = require("./request").Builder;

  pushPlugin = require("./push/plugin");

  pullPlugin = require("./pull/plugin");

  collectPlugin = require("./collect/plugin");

  plugins = require("./plugins");

  disposable = require("disposable");

  _ = require("underscore");

  Router = (function() {
    /*
    */
    function Router() {
      this.directors = {};
      this.parse = crema;
      this._requestBuilder = new RequestBuilder(this);
      this._plugins = new plugins(this);
      this.use(pushPlugin);
      this.use(pullPlugin);
      this.use(collectPlugin);
    }

    /*
    	 uses a dispatcher
    */

    Router.prototype.use = function(plugin) {
      return this._plugins.add(plugin);
    };

    /*
    */

    Router.prototype.using = function() {
      return this._plugins.using();
    };

    /*
    	 listens for a request
    */

    Router.prototype.on = function(routeOrListeners, ops, callback) {
      var listenerDisposables, route, routes, type, _fn, _i, _len,
        _this = this;
      if (!callback) {
        callback = ops;
        ops = {};
      }
      listenerDisposables = disposable.create();
      if (typeof routeOrListeners === "object" && !callback) {
        for (type in routeOrListeners) {
          listenerDisposables.add(this.on(type, routeOrListeners[type]));
        }
        return listenerDisposables;
      }
      if (typeof routeOrListeners === "string") {
        routes = crema(routeOrListeners);
      } else if (routeOrListeners instanceof Array) {
        routes = routeOrListeners;
      } else {
        routes = [routeOrListeners];
      }
      _fn = function(route) {
        if (ops.type) route.type = ops.type;
        if (ops.tags) _.extend(route.tags, ops.tags);
        listenerDisposables.add(_this.director(route.type).addListener(route, callback));
        return _this._plugins.newListener({
          route: route,
          callback: callback
        });
      };
      for (_i = 0, _len = routes.length; _i < _len; _i++) {
        route = routes[_i];
        _fn(route);
      }
      return listenerDisposables;
    };

    /*
    	 returns the given director, or throws an error if it doesn't exist
    */

    Router.prototype.director = function(type) {
      var director;
      director = this.directors[type];
      if (!director) throw new Error("director " + type + " does not exist");
      return director;
    };

    /*
    */

    Router.prototype.paths = function(ops) {
      var director, name, paths;
      paths = [];
      for (name in this.directors) {
        director = this.directors[name];
        paths = paths.concat(director.paths(ops));
      }
      return paths;
    };

    Router.prototype.dispatch = function(requestWriter) {
      return this.director(requestWriter.type).dispatch(requestWriter);
    };

    /*
    	 abreviated
    */

    Router.prototype.req = function() {
      return this.request.apply(this, arguments);
    };

    /*
    	 Initializes a new request
    */

    Router.prototype.request = function(path, query, headers) {
      return this._requestBuilder.clean().path(typeof path === "string" ? crema.parsePath(path) : path).query(query).headers(headers);
    };

    return Router;

  })();

  module.exports = Router;

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/concrete/messenger.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var LinkedQueue, Response, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  LinkedQueue = require("../collections/linkedQueue");

  Response = require("./response");

  _ = require("underscore");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    /*
    	 constructor
    */

    function _Class(request, first, director) {
      var _this = this;
      this.request = request;
      this.first = first;
      this.director = director;
      this.request = this.request;
      this.router = director.router;
      this.from = request.from;
      _Class.__super__.constructor.call(this, first);
      this.response = new Response(this);
      this.response.reader().dump(function() {
        return _this.request.callback.apply(_this.request, arguments);
      }, this.request.headers);
    }

    /*
    */

    _Class.prototype.start = function() {
      return this.next();
    };

    /*
    */

    _Class.prototype.data = function(name) {
      var obj, _i, _len;
      if (arguments.length === 0) {
        return _.extend({}, this.request.sanitized, this.current.params, this.request.query);
      } else if (arguments.length > 1) {
        obj = {};
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          name = arguments[_i];
          obj[name] = this.data(name);
        }
        obj;
      }
      return this.request.sanitized[name] || this.current.params[name] || (this.request.query ? this.request.query[name] : null);
    };

    /*
    	 flattens all param data into one object
    */

    _Class.prototype.flattenData = function(reset) {
      var allData, cur;
      if (this._allData && !reset) return this._allData;
      cur = this.current;
      allData = _.defaults(cur.params, this.request.query);
      cur = cur.getNextSibling();
      while (cur) {
        _.defaults(allData, cur.params);
        cur = cur.getNextSibling();
      }
      return this._allData = allData;
    };

    /*
    */

    _Class.prototype._onNext = function(middleware, args) {
      if (args && args.length) {
        if (args[0]) {
          return _onError(args[0]);
        } else {
          _onNextData(args[1]);
        }
      }
      this.request.params = middleware.params;
      try {
        this.request.cache(this.hasNext);
        return this._next(middleware, args);
      } catch (e) {
        return this.response.error(e);
      }
    };

    /*
    */

    _Class.prototype._next = function(middleware) {
      return middleware.listener(this);
    };

    /*
    */

    _Class.prototype._onError = function(error) {};

    /*
    */

    _Class.prototype._onNextData = function() {};

    return _Class;

  })(LinkedQueue);

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/concrete/director.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Messenger, RequestMiddleware, crema, dolce;

  dolce = require("dolce");

  RequestMiddleware = require("./middleware");

  crema = require("crema");

  Messenger = require("./messenger");

  /*
  
  Director process:
  */

  module.exports = (function() {
    /*
    	 some directors are passive, meaning errors aren't returned if a route does not exist. This goes for collectors,
    	 emitters, etc.
    */
    _Class.prototype.passive = false;

    /*
    	 constructor
    */

    function _Class(name, router) {
      this.name = name;
      this.router = router;
      this._collection = dolce.collection();
    }

    /*
    	 returns number of listeners based on path given
    */

    _Class.prototype.numListeners = function(path, ops) {
      return this._collection.get(path, ops).chains.length;
    };

    /*
    	 dispatches a request
    */

    _Class.prototype.dispatch = function(requestWriter) {
      var chain, chains, messanger, middleware, numChains, numRunning, oldAck, requestReader, _i, _len;
      try {
        chains = this.getListeners(requestWriter, void 0, !this.passive);
      } catch (e) {
        return requestWriter.callback(new Error("" + this.name + " " + e.message));
      }
      numChains = chains.length;
      numRunning = numChains;
      oldAck = requestWriter.callback;
      requestWriter.running = !!numChains;
      requestWriter.callback = function() {
        requestWriter.running = !!(--numRunning);
        if (oldAck) {
          return oldAck.apply(this, Array.apply(null, arguments).concat([numRunning, numChains]));
        }
      };
      if (!!!chains.length && !this.passive) {
        requestWriter.callback(new Error("" + this.name + " route \"" + (crema.stringifySegments(requestWriter.path.segments)) + "\" does not exist"));
        return this;
      }
      for (_i = 0, _len = chains.length; _i < _len; _i++) {
        chain = chains[_i];
        requestReader = requestWriter.reader();
        middleware = RequestMiddleware.wrap(chain, requestWriter.pre, requestWriter.next, this);
        messanger = this._newMessenger(requestReader, middleware);
        messanger.start();
      }
      return this;
    };

    /*
    	 adds a route listener to the collection tree
    */

    _Class.prototype.addListener = function(route, callback) {
      disposable;
      var disposable, oldCallback;
      if (route.tags.one) {
        oldCallback = callback;
        callback = function() {
          oldCallback.apply(this, arguments);
          return disposable.dispose();
        };
      }
      this._validateListener(route, callback);
      return disposable = this._collection.add(route, callback);
    };

    /*
    */

    _Class.prototype.removeListeners = function(route) {
      return this._collection.remove(route.path, {
        tags: route.tags
      });
    };

    /*
    */

    _Class.prototype.paths = function(ops) {
      var listener, _i, _len, _ref, _results;
      _ref = this._collection.find(ops);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        _results.push({
          tags: listener.tags,
          type: this.name,
          value: listener.path,
          segments: listener.segments
        });
      }
      return _results;
    };

    /*
    */

    _Class.prototype.listenerQuery = function(ops) {
      var filter, key, tag;
      filter = [];
      for (key in ops.filter) {
        tag = {};
        tag[key] = ops.filter[key];
        filter.push(tag);
      }
      return {
        $or: [
          {
            $and: filter
          }, {
            unfilterable: {
              $exists: true
            }
          }
        ]
      };
    };

    /*
    */

    _Class.prototype.getListeners = function(request, expand, throwError) {
      return this._collection.get(request.path, {
        siftTags: this.listenerQuery(request),
        expand: expand,
        throwErrors: throwError
      }).chains;
    };

    /*
    	 returns a new request
    */

    _Class.prototype._newMessenger = function(request, middleware) {
      return new Messenger(request, middleware, this);
    };

    /*
    */

    _Class.prototype._validateListener = function(route) {
      var listeners;
      if (this.passive) return;
      listeners = this._collection.get(route.path, {
        tags: route.tags,
        expand: false
      });
      if (!!listeners.length) {
        throw new Error("Route \"" + route.path.value + "\" already exists");
      }
    };

    return _Class;

  })();

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/request.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Reader, RequestReader, RequestWriter, Writer, outcome,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Reader = require("./io/reader");

  Writer = require("./io/writer");

  outcome = require("outcome");

  exports.Reader = RequestReader = (function(_super) {

    __extends(RequestReader, _super);

    /*
    	 constructor
    */

    function RequestReader(writer, from, path, query, sanitized, headers, filter, callback) {
      this.writer = writer;
      this.from = from;
      this.path = path;
      this.query = query;
      this.sanitized = sanitized != null ? sanitized : {};
      this.headers = headers != null ? headers : {};
      this.filter = filter != null ? filter : {};
      this.callback = callback != null ? callback : null;
      RequestReader.__super__.constructor.call(this, writer);
    }

    return RequestReader;

  })(Reader);

  exports.Writer = RequestWriter = (function(_super) {

    __extends(RequestWriter, _super);

    /*
    */

    function RequestWriter(_ops) {
      this._ops = _ops;
      this.next = _ops.next;
      this.pre = _ops.pre;
      this.path = _ops.path;
      this.type = _ops.type;
      this.from = _ops.from;
      this.query = _ops.query;
      this.filter = _ops.filter || {};
      this.headers = _ops.headers;
      this.callback = _ops.callback;
      this.sanitized = _ops.sanitized;
      RequestWriter.__super__.constructor.call(this);
    }

    /*
    */

    RequestWriter.prototype.reader = function() {
      return new RequestReader(this, this.from, this.path, this.query, this.sanitized, this.headers, this.filter, this.callback);
    };

    return RequestWriter;

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
      return this._objParam('filter', arguments, function(value) {
        if (typeof value === 'boolean') {
          return {
            $exists: value
          };
        }
        return value;
      });
    };

    /*
    	 DEPRECATED
    */

    _Class.prototype.headers = function(value) {
      return this.header(value);
    };

    /*
    	 The header data explaining the request, such as tags, content type, etc.
    */

    _Class.prototype.header = function(keyOrHeaders, value) {
      return this._objParam('headers', arguments);
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

    _Class.prototype.path = function(value) {
      return this._param('path', arguments);
    };

    /* 
    	 Query would be something like ?name=craig&last=condon
    */

    _Class.prototype.query = function(value) {
      return this._param('query', arguments);
    };

    /* 
    	 data that has been cleaned up after validation
    */

    _Class.prototype.sanitized = function(value) {
      return this._param('sanitized', arguments);
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
      writer = new RequestWriter(this._ops);
      this.router.dispatch(writer);
      return writer;
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
      return !!this.listeners().length;
    };

    /*
    */

    _Class.prototype.listeners = function() {
      return this.router.director(this.type()).getListeners({
        path: this._ops.path,
        filter: this._ops.filter
      }, false);
    };

    /*
    */

    _Class.prototype._param = function(name, args) {
      if (!args.length) return this._ops[name];
      this._ops[name] = args[0];
      return this;
    };

    /*
    */

    _Class.prototype._objParam = function(name, args, getValue) {
      var key, keyOrObj, value;
      if (!args.length) return this._ops[name];
      if (!this._ops[name]) this._ops[name] = {};
      keyOrObj = args[0];
      value = args[1];
      if (typeof keyOrObj === 'string') {
        if (args.length === 1) return this._ops.headers[keyOrObj];
        this._ops[name][keyOrObj] = getValue ? getValue(value) : value;
      } else {
        for (key in keyOrObj) {
          this._objParam(name, [key, keyOrObj[key]], getValue);
        }
      }
      return this;
    };

    return _Class;

  })();

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/concrete/response.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Reader, Response, ResponseReader, Writer, outcome, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Writer = require("../io/writer");

  Reader = require("../io/reader");

  _ = require("underscore");

  outcome = require("outcome");

  ResponseReader = (function(_super) {

    __extends(ResponseReader, _super);

    function ResponseReader() {
      ResponseReader.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    ResponseReader.prototype._listenTo = function() {
      return ResponseReader.__super__._listenTo.call(this).concat("headers");
    };

    /*
    */

    ResponseReader.prototype._listen = function() {
      var _this = this;
      ResponseReader.__super__._listen.call(this);
      return this.on("headers", function(headers) {
        return _this.headers = headers;
      });
    };

    ResponseReader.prototype._dumpCached = function(pipedReader) {
      if (this.headers) pipedReader.emit("headers", this.headers);
      return ResponseReader.__super__._dumpCached.call(this, pipedReader);
    };

    return ResponseReader;

  })(Reader);

  module.exports = Response = (function(_super) {

    __extends(Response, _super);

    /*
    */

    function Response(messenger) {
      var _this = this;
      this.messenger = messenger;
      Response.__super__.constructor.call(this);
      this._headers = {};
      this.once("data", function() {
        return _this.sendHeaders();
      });
      this.once("end", function() {
        return _this.sendHeaders();
      });
    }

    /*
    */

    Response.prototype.header = function(typeOrObj, value) {
      if (typeof typeOrObj === "object") {
        _.extend(this._headers, typeOrObj);
      } else {
        this._headers[typeOrObj] = value;
      }
      return this;
    };

    /*
    	 DEPRECATED
    */

    Response.prototype.headers = function(typeOrObj, value) {
      return this.header(typeOrObj, value);
    };

    /*
    */

    /*
    */

    /*
    	 wrap-around for error handling
    */

    Response.prototype.success = function(success) {
      var _this = this;
      if (!this._outcome) {
        this._outcome = outcome.error(function(err) {
          return _this.error(err);
        });
      }
      return this._outcome.success(success);
    };

    /*
    */

    Response.prototype.sendHeaders = function() {
      if (this.sentHeaders) return this;
      this.sentHeaders = true;
      this.emit("headers", this._headers);
      return this;
    };

    /*
    */

    Response.prototype.reader = function() {
      return new ResponseReader(this);
    };

    return Response;

  })(Writer);

  Writer.prototype.writable = true;

}).call(this);

});

_sardines.register("/modules/crema/lib/index.js", function(require, module, exports, __dirname, __filename) {
	

function parseTokens(route) {
	return route./*route.replace(/\//g,' ').*/replace(/\s+/g,' ').split(' ');
}

function splitOr(tokens, route, routes, start) {

	for(var i = start, n = tokens.length; i < n; i++) {
		var token = tokens[i];

		if(token.toLowerCase() == 'or') {
			var orRoute = route.concat();

			orRoute.pop();

			//skip one token
			orRoute.push(tokens[++i]);

			splitOr(tokens, orRoute, routes, i + 1);

			//this chunk of code will execute if we get a chain of OR statements such as:
			//-method=GET OR -method=POST OR -method=PUT. In which case, we need to skip them.     
			while(i < n - 1 && tokens[i + 1].toLowerCase() == 'or') {
				i += 2;
			}
		} else {
			route.push(token);
		}
	}


	routes.push(route);

	return routes;
}


function parsePath(path) {

	var segments = path instanceof Array ? path : path.replace(/^\/|\/$/g,'').split(/[\s\/]+/g);

	var expr = { value: segments.join('/'), segments: [] };

	for(var i = 0, n = segments.length; i < n; i++) {
		var segment = segments[i],
		isParam = (segment.substr(0,1) == ':');

		expr.segments.push({ value: isParam ? segment.substr(1) : segment, param: isParam });
	}

	return expr;
}

function parseRoutePaths(rootExpr, tokens, start) {

	var n = tokens.length,
	currentExpression = rootExpr;
	currentExpression.path = parsePath(tokens[n - 1]);


	// console.log(start)
	for(var i = n - 2; i >= start; i--) {
		  
		var token = tokens[i], buffer = [];


		if(token == '->') continue;

		//middleware flag - skip  
		

		currentExpression = currentExpression.thru = { path: parsePath(token) };
	}


	return rootExpr;
}

function fixRoute(route, grammar) {
	
	for(var expr in grammar) {
		route = route.replace(grammar[expr], expr);
	}

	return route;
}


function parseRoute(route, grammar) {

	if(grammar) {
		route = fixRoute(route, grammar);
	}

	var tokens = parseTokens(route),
	routes = splitOr(tokens, [], [], 0),
	currentRoute,
	expressions = [];


	for(var i = 0, n = routes.length; i < n; i++) {
		
		var routeTokens = routes[i],
		expr = { tags: {} },
		start = 0;
		
		if(routeTokens[0].match(/^\w+$/) && routeTokens[1] != '->' && routeTokens.length-1)
		{
			start = 1;
			expr.type = routeTokens[0];
		}

		for(var j = start, jn = routeTokens.length; j < jn; j++) {
			
			var routeToken = routeTokens[j];

			//is it a tag?
			if(routeToken.substr(0, 1) == '-') {
				
				var tagParts = routeToken.split('=');

				var tagName = tagParts[0].substr(1);//remove the dash
				
				expr.tags[tagName] = tagParts.length > 1 ? tagParts[1] : true;

				//continue until there are no more tags
				continue;
			} 

			expressions.push(parseRoutePaths(expr, routeTokens, j));
			break;
		}
	}


	return expressions;
}




module.exports = function(source, grammar) {
	return parseRoute(source, grammar);
}


module.exports.grammar = function(grammar) {
	
	return {
		fixRoute: function(source) {
			return fixRoute(source, grammar);
		},
		parse: function(source) {
			return parseRoute(source, grammar);
		}
	}
}


module.exports.parsePath = parsePath;

module.exports.stringifySegments = function(segments, params, ignoreParams) {
	var stringified = [];
	if(!params) params = {};

	for(var i = 0, n = segments.length; i < n; i++) {

		var segment = segments[i], segmentValue;

		if(!ignoreParams && segment.param) {
			segmentValue = params[segment.value] || ':' + segment.value;
		} else {
			segmentValue = segment.value;
		}

		stringified.push(segmentValue);

	}

	return stringified.join('/');
}


module.exports.stringifyTags = function(tags) {
	var stringified = [];

	for(var tagName in tags) {
		var tagValue = tags[tagName];

		if(tagValue === true) {
			stringified.push('-' + tagName);
		} else {
			stringified.push('-' + tagName+'='+tagValue);
		}
	}

	return stringified.join(' ');
}



module.exports.stringify = function(route) {
	
	var stringified = [];
	
	if(route.type) stringified.push(route.type);

	stringified.push(module.exports.stringifyTags(route.tags));
	stringified.push(module.exports.stringifySegments(route.path.segments));
	
	return stringified.join(' ');
}
});

_sardines.register("/modules/crema", function(require, module, exports, __dirname, __filename) {
	module.exports = require('modules/crema/lib/index.js');
});

_sardines.register("/modules/beanpoll/lib/push/plugin.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Director;

  Director = require("./director");

  module.exports = function(router) {
    /*
    */
    var director;
    director = new Director("push", router);
    return {
      /*
      */
      name: director.name,
      /*
      */
      director: director,
      /*
      */
      newListener: function(listener) {
        return router.request('new/listener').tag('private', true).query(listener).push();
      },
      /*
      */
      router: {
        push: function(path, query, headers) {
          return this.request(path, query, headers).push(null);
        }
      },
      /*
      */
      request: {
        push: function(data) {
          var writer;
          writer = this.dispatch(director.name);
          if (!!arguments.length) writer.end(data);
          return writer;
        }
      }
    };
  };

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/pull/plugin.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Director, outcome;

  Director = require("./director");

  outcome = require("outcome");

  module.exports = function(router) {
    var director;
    director = new Director("pull", router);
    return {
      name: director.name,
      /*
      */
      director: director,
      /*
      */
      newListener: function(listener) {
        if (!!listener.route.tags.pull) {
          return router.request(listener.route.path).headers(listener.route.tags).success(listener.callback).error(function() {}).pull();
        }
      },
      /*
      	 extend the router
      */
      router: {
        pull: function(path, query, headers, callback) {
          return this._pull(path, query, headers, callback, director.name);
        },
        _pull: function(path, query, headers, callback, type) {
          if (typeof query === 'function') {
            callback = query;
            headers = null;
            query = null;
          }
          if (typeof headers === 'function') {
            callback = headers;
            headers = null;
          }
          return this.request(path, query, headers)[type](callback);
        }
      },
      /*
      	 extend the request builder
      */
      request: {
        pull: function(query, callback) {
          return this._pull(query, callback, director.name);
        },
        _pull: function(query, callback, type) {
          if (typeof query === 'function') {
            callback = query;
            query = null;
          }
          if (!!query) this.query(query);
          if (!!callback) this.response(callback);
          return this.dispatch(type);
        }
      }
    };
  };

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/collect/plugin.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Director, outcome;

  Director = require("./director");

  outcome = require("outcome");

  module.exports = function(router) {
    var director;
    director = new Director("collect", router);
    return {
      name: director.name,
      director: director,
      router: {
        collect: function(path, query, headers, callback) {
          return this._pull(path, query, headers, callback, director.name);
        }
      },
      newListener: function(listener) {
        if (!!listener.route.tags.collect) {
          return router.request(listener.route.path).headers(listener.route.tags).success(listener.callback).collect();
        }
      },
      request: {
        collect: function(query, callback) {
          return this._pull(query, callback, director.name);
        }
      }
    };
  };

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/plugins.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Request, _;

  Request = require('./request');

  _ = require('underscore');

  module.exports = (function() {
    /*
    */
    function _Class(router) {
      this.router = router;
      this._pluginsByName = {};
      this._using = [];
    }

    _Class.prototype.using = function() {
      return this._using;
    };

    /*
    */

    _Class.prototype.add = function(plugin) {
      var mod, plg, _i, _len;
      if (plugin instanceof Array) {
        for (_i = 0, _len = plugin.length; _i < _len; _i++) {
          plg = plugin[_i];
          this.add(plg);
        }
        return;
      }
      this._using.push(plugin);
      mod = plugin(this.router);
      this._pluginsByName[mod.name] = mod;
      _.extend(this.router._requestBuilder, mod.request);
      _.extend(this.router, mod.router);
      if (mod.director) return this.router.directors[mod.name] = mod.director;
    };

    /*
    */

    _Class.prototype.get = function(name) {
      return this._pluginsByName[name];
    };

    /*
    	 Used incase the listener needs to be handler for a particular reason, e.g: push -pull /some/route would be a binding.
    */

    _Class.prototype.newListener = function(listener) {
      return this._emit('newListener', listener);
    };

    /*
    */

    _Class.prototype._emit = function(type, data) {
      var plugin, pluginName, _results;
      _results = [];
      for (pluginName in this._pluginsByName) {
        plugin = this._pluginsByName[pluginName];
        if (plugin[type]) {
          _results.push(plugin[type](data));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return _Class;

  })();

}).call(this);

});

_sardines.register("/modules/disposable/lib/index.js", function(require, module, exports, __dirname, __filename) {
	

(function() {

	var disposable = {};
		


	disposable.create = function() {
		
		var self = {},
		disposables = [];


		self.add = function(disposable) {

			if(typeof disposable == 'function') {
				
				var disposableFunc = disposable, args = Array.prototype.slice.call(arguments, 0);

				//remove the func
				args.shift();


				disposable = {
					dispose: function() {
						disposableFunc.apply(null, args);
					}
				};
			}


			disposables.push(disposable);

			return {
				dispose: function() {
					var i = disposables.indexOf(disposable);

					if(i > -1) disposables.splice(i, 1);
				}
			};
		};

		self.addTimeout = function(timerId) {
			return self.add(clearTimeout, timerId);
		};

		self.addInterval = function(timerId) {
			return self.add(clearInterval, timerId);
		};



		self.dispose = function() {
			
			for(var i = disposables.length; i--;) {
				disposables[i].dispose();
			}

			disposables = [];
		};

		return self;
	}



	if(typeof module != 'undefined') {
		module.exports = disposable;
	}

	if(typeof window != 'undefined') {
		window.disposable = disposable;
	}


})();

var disposable = module.exports.create();


disposable.dispose();

});

_sardines.register("/modules/disposable", function(require, module, exports, __dirname, __filename) {
	module.exports = require('modules/disposable/lib/index.js');
});

_sardines.register("/modules/underscore/underscore.js", function(require, module, exports, __dirname, __filename) {
	//     Underscore.js 1.2.3
//     (c) 2009-2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js** and **"CommonJS"**, with
  // backwards-compatibility for the old `require()` API. If we're not in
  // CommonJS, add `_` to the global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else if (typeof define === 'function' && define.amd) {
    // Register as a named module with AMD.
    define('underscore', function() {
      return _;
    });
  } else {
    // Exported as a string, for Closure Compiler "advanced" mode.
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.2.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = concat.apply([func], arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (hasOwnProperty.call(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (hasOwnProperty.call(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && hasOwnProperty.call(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape, function(match, code) {
           return "',_.escape(" + code.replace(/\\'/g, "'") + "),'";
         })
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, _);
    return function(data) {
      return func.call(this, data, _);
    };
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});

_sardines.register("/modules/underscore", function(require, module, exports, __dirname, __filename) {
	module.exports = require('modules/underscore/underscore.js');
});

_sardines.register("/modules/beanpoll/lib/collections/linkedQueue.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var EventEmitter, LinkedQueue,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  EventEmitter = require('events').EventEmitter;

  module.exports = LinkedQueue = (function(_super) {

    __extends(LinkedQueue, _super);

    LinkedQueue.prototype.hasNext = true;

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
      if (!this.hasNext) return false;
      this._setNext();
      this._onNext(this.current, arguments);
      return true;
    };

    /*
    	 skips middleware
    */

    LinkedQueue.prototype.skipNext = function(count) {
      if (count == null) count = 2;
      if (!this.hasNext) return false;
      while ((count--) && this.hasNext) {
        this._setNext();
      }
      this._onNext(this.current);
      return true;
    };

    /*
    */

    LinkedQueue.prototype._setNext = function() {
      this.current = this.current ? this.current.getNextSibling() : this.first;
      this.hasNext = this.current.getNextSibling();
      if (!this.hasNext && !this.ended) {
        this.ended = true;
        return this._onEnd();
      }
    };

    /*
    */

    LinkedQueue.prototype._onNext = function(middleware) {};

    /*
    */

    LinkedQueue.prototype._onEnd = function() {};

    return LinkedQueue;

  })(EventEmitter);

  module.exports = LinkedQueue;

}).call(this);

});

_sardines.register("/modules/dolce/lib/index.js", function(require, module, exports, __dirname, __filename) {
	exports.collection = require('./collection');
});

_sardines.register("/modules/dolce", function(require, module, exports, __dirname, __filename) {
	module.exports = require('modules/dolce/lib/index.js');
});

_sardines.register("/modules/beanpoll/lib/concrete/middleware.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var LinkedList, Middleware,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  LinkedList = require("../collections/linkedList");

  module.exports = Middleware = (function(_super) {

    __extends(Middleware, _super);

    /*
    	 constructor
    */

    function Middleware(item, director) {
      this.director = director;
      this.listener = item.value;
      this.path = {
        segments: item.cmpSegments
      };
      this.params = item.params;
      this.tags = item.tags;
    }

    return Middleware;

  })(LinkedList);

  /*
   Wraps the chained callbacks in middleware
  */

  Middleware.wrap = function(chain, pre, next, director) {
    var current, item, prev, _i, _len;
    for (_i = 0, _len = chain.length; _i < _len; _i++) {
      item = chain[_i];
      current = new Middleware(item, director);
      if (prev) current.addPrevSibling(prev, true);
      prev = current;
    }
    if (typeof pre === 'function') {
      current.getFirstSibling().addPrevSibling(new Middleware({
        value: pre,
        params: {},
        tags: {},
        path: {
          segments: []
        }
      }));
    }
    if (typeof next === 'function') {
      current.addNextSibling(new Middleware({
        value: next,
        params: {},
        tags: {},
        path: {
          segments: []
        }
      }));
    }
    return current.getFirstSibling();
  };

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/io/reader.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Reader, Stream, disposable,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Stream = require("stream").Stream;

  disposable = require("disposable");

  module.exports = Reader = (function(_super) {

    __extends(Reader, _super);

    /*
    */

    function Reader(source) {
      this.source = source;
      Reader.__super__.constructor.call(this);
      this.setMaxListeners(0);
      this._listen();
    }

    /*
    	 needs to be overridable incase there's more stuff to listen to (headers)
    */

    Reader.prototype._listenTo = function() {
      return ["data", "end", "error"];
    };

    /*
    */

    Reader.prototype._listen = function() {
      var event, listeners, _fn, _i, _len, _ref,
        _this = this;
      this._buffer = [];
      listeners = disposable.create();
      if (this.source) {
        _ref = this._listenTo();
        _fn = function(event) {
          var onEvent;
          onEvent = function(arg1, arg2) {
            _this._started = true;
            return _this.emit(event, arg1, arg2);
          };
          _this.source.on(event, onEvent);
          return listeners.add(function() {
            return _this.source.removeListener(event, onEvent);
          });
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          _fn(event);
        }
      }
      this.on("data", function(data, encoding) {
        if (!_this._cache) return;
        return _this._buffer.push({
          chunk: data,
          encoding: encoding
        });
      });
      this.on("end", function() {
        if (_this.ended) throw new Error("Cannot end more than once");
        return _this.ended = true;
      });
      return this.on("error", function(err) {
        return _this.error = err;
      });
    };

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
      var pipedStream, wrappedCallback;
      if (!ops) ops = {};
      wrappedCallback = this._dumpCallback(callback, ops);
      pipedStream = this._started ? new Reader(this) : this;
      wrappedCallback.call(this, null, pipedStream);
      if (!this._started) return;
      return this._dumpCached(pipedStream, ops);
    };

    /*
    */

    Reader.prototype._dumpCallback = function(callback, ops) {
      var listeners, pipeTo,
        _this = this;
      if (callback instanceof Stream) {
        ops.stream = true;
        pipeTo = callback;
        callback = function(err, stream) {
          var type, _fn, _i, _len, _ref;
          _ref = _this._listenTo();
          _fn = function(type) {
            return stream.on(type, function() {
              return pipeTo.emit.apply(pipeTo, [type].concat(Array.prototype.slice.call(arguments)));
            });
          };
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            type = _ref[_i];
            _fn(type);
          }
          return null;
        };
      }
      if (typeof callback === 'object') {
        ops.stream = true;
        listeners = callback;
        callback = function(err, stream) {
          var type, _results;
          _results = [];
          for (type in listeners) {
            _results.push(stream.on(type, listeners[type]));
          }
          return _results;
        };
      }
      if (ops.stream) return callback;
      return function(err, reader) {
        var buffer, onEnd;
        if (err) return callback(err);
        buffer = [];
        onEnd = function(err) {
          var chunk, _i, _len, _results;
          if (ops.batch) return callback.call(_this, err, buffer);
          if (!buffer.length) return callback.call(_this, err);
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
        reader.on("data", function(data, encoding) {
          return buffer.push(data);
        });
        reader.on("error", onEnd);
        return reader.on("end", onEnd);
      };
    };

    /*
    */

    Reader.prototype._dumpCached = function(pipedReader) {
      var data, _i, _len, _ref;
      _ref = this._buffer;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        pipedReader.emit("data", data.chunk, data.encoding);
      }
      if (this.ended) pipedReader.emit("end");
      if (this.error) return pipedReader.emit("error");
    };

    return Reader;

  })(Stream);

  Reader.prototype.readable = true;

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/io/writer.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Reader, Stream, Writer,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Stream = require("stream").Stream;

  Reader = require("./reader");

  module.exports = Writer = (function(_super) {

    __extends(Writer, _super);

    function Writer() {
      Writer.__super__.constructor.call(this);
      this.setMaxListeners(0);
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

    Writer.prototype.reader = function() {
      return new Reader(this);
    };

    return Writer;

  })(Stream);

  Writer.prototype.writable = true;

}).call(this);

});

_sardines.register("/modules/outcome/lib/index.js", function(require, module, exports, __dirname, __filename) {
	var EventEmitter = require('events').EventEmitter,

//used for dispatching unhandledError messages
globalEmitter = new EventEmitter();


var Chain = function(listeners) {

	if(!listeners) listeners = { };


	var fn = function() {

		var args = Array.apply(null, arguments), orgArgs = arguments;

		if(listeners.callback) {

			listeners.callback.apply(this, args);

		}

		if(listeners.handle) {
			
			listeners.handle.apply(listeners, args);

		} else {

			//error should always be first args
			err = args.shift();

			//on error
			if(err) {

				listeners.error.call(this, err);

			} else
			if(listeners.success) {
				
				listeners.success.apply(this, args);

			}

		}	
		
	};

	fn.listeners = listeners;

	//DEPRECATED
	fn.done = function(fn) {

		return fn.callback(fn);

	}

	fn.handle = function(value) {

		return _copy({ handle: value });
		
	}

	fn.callback = function(value) {
		
		return _copy({ callback: value });

	}

	fn.success = function(value) {
			
		return _copy({ success: value });

	}

	fn.error = function(value) {

		return _copy({ error: value });

	}


	//error does not exist? set the default which throws one
	if(!listeners.error) {

		listeners.error = function(err) {

			//no error callback? check of unhandled error is present, or throw
			if(!globalEmitter.emit('unhandledError', err) && !listeners.callback) throw err;

		}

	}


		
	function _copy(childListeners) {

		//copy these listeners to a new chain
		for(var type in listeners) {
			
			if(childListeners[type]) continue;

			childListeners[type] = listeners[type];

		}

		return Chain(childListeners);

	}

	return fn;
}


module.exports = function(listeners) {

	return Chain(listeners);

}

//bleh this could be better. Need to copy the chain functions to the module.exports var
var chain = Chain();

//copy the obj keys to module.exports
Object.keys(chain).forEach(function(prop) {
	
	//on call of error, success, callback - make a new chain
	module.exports[prop] = function() {
		
		var child = Chain();

		return child[prop].apply(child, arguments);
	}
});


//running online?
if(typeof window != 'undefined') {
	
	window.outcome = module.exports;

}





});

_sardines.register("/modules/outcome", function(require, module, exports, __dirname, __filename) {
	module.exports = require('modules/outcome/lib/index.js');
});

_sardines.register("/modules/beanpoll/lib/push/director.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Director, Messenger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Director = require("../concrete/director");

  Messenger = require("./messenger");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.passive = true;

    /*
    */

    _Class.prototype._newMessenger = function(request, middleware) {
      return new Messenger(request, middleware, this);
    };

    return _Class;

  })(Director);

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/pull/director.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Director, Messenger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Director = require("../concrete/director");

  Messenger = require("./messenger");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.passive = false;

    /*
    */

    _Class.prototype._newMessenger = function(request, middleware) {
      return new Messenger(request, middleware, this);
    };

    /*
    */

    _Class.prototype.getListeners = function(request, search) {
      return this.prepareListeners(_Class.__super__.getListeners.call(this, request, search));
    };

    /*
    */

    _Class.prototype.prepareListeners = function(listeners) {
      if (!!listeners.length) {
        return [listeners[0]];
      } else {
        return [];
      }
    };

    return _Class;

  })(Director);

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/collect/director.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Director,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Director = require("../pull/director");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.passive = true;

    /*
    */

    _Class.prototype.prepareListeners = function(listeners) {
      return listeners;
    };

    return _Class;

  })(Director);

}).call(this);

});

_sardines.register("/modules/events", function(require, module, exports, __dirname, __filename) {
	// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var isArray = Array.isArray;

function EventEmitter() { }
exports.EventEmitter = EventEmitter;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function() {
  var type = arguments[0];
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var l = arguments.length;
        var args = new Array(l - 1);
        for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var l = arguments.length;
    var args = new Array(l - 1);
    for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // If we've already got an array, just append.
    this._events[type].push(listener);

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('.once only takes instances of Function');
  }

  var self = this;
  function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  };

  g.listener = listener;
  self.on(type, g);

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var position = -1;
    for (var i = 0, length = list.length; i < length; i++) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener))
      {
        position = i;
        break;
      }
    }

    if (position < 0) return this;
    list.splice(position, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (list === listener ||
             (list.listener && list.listener === listener))
  {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

});

_sardines.register("/modules/dolce/lib/collection.js", function(require, module, exports, __dirname, __filename) {
	var crema  = require('crema'),
tree 	   = require('./tree'),
sift 	   = require('sift'),
_          = require('underscore');

var routeTypes = {
	'*': 'extend',
	'+': 'extend',
	'**': 'greedy'
}


var collection = module.exports = function() {
	
	var _rootTree = tree(),
	self = {},
	_id = 0;


	var _addRoute = self.add = function(route, value) {

		var tree, type, segments = route.path.segments, 
		lastPath = segments[segments.length - 1].value, 
		secondLastPath = segments.length > 1 ? segments[segments.length - 2].value : null;


		if(type = routeTypes[lastPath]) {
			
			//remove the asterick
			route.path.segments.pop();

		} else {

			type = 'endpoint';

		}


		var thru = [], cthru = route.thru;

		while(cthru) {
			thru.unshift(cthru.path.segments);
			cthru = cthru.thru;
		}

		//next, let's find the tree this route belongs too
		tree = _findTree(route.path.segments, true);


		//add the data to the tree obj
		return tree.addListener(type, {

			routeStr: crema.stringify(route),

			//filterable tags
			tags: route.tags,

			//path to the route -- needed to fill in extra data
			segments: route.path.segments,

			//explicit chain which gets expanded at runtime
			thru: thru,

			id: _id++,

			//the callback function
			value: value

		}, type);

	};

	/**
	 * returns TRUE if the given type exists
	 */

	self.contains = function(path, ops) {

		if(!ops) ops = {};

		var child = _findTree(path.segments);

		return !!child ? !!_andSifter(ops, child.collections.endpoint).length : false;
	}

	/**
	 * returns collections and their chained data
	 */

	self.get = function(path, ops) {
		
		if(!ops) ops = {};


		//only allow path/to/collection in get vs pull blown parsing with metadata - not necessary
		var chains = _chains(path.segments, ops, true).sort(function(a, b) {
			return Number(a[a.length - 1].tags.priority || 0) > Number(b[b.length - 1].tags.priority || 0) ? -1 : 1;
		});

			

		return {
			segments: path.segments,
			tags: ops.tags,
			chains: chains
		}
	};



	/**
	 */

	self.remove = function(path, ops) {

		var child = _findTree(path.segments),
		sifter = _andSifter(ops);

		for(var i = child.collections.endpoint.length; i--;) {
			if(sifter.test(child.collections.endpoint[i])) {
				child.collections.endpoint.splice(i, 1);
			}
		}

	}

	/**
	 * finds routes based on the filter tags given WITHOUT expanding them
	 */

	self.find = function(ops) {

		var tagSifter, found = [];

		if(ops.tags) {
			tagSifter = _andSifter(ops);
		} else 
		if(ops.siftTags) {
			tagSifter = sift({ tags: ops.siftTags });
		}



		_rootTree.traverse(function(tree) {

			if(tagSifter)
			for(var i = tree.collections.endpoint.length; i--;) {

				var data = tree.collections.endpoint[i];

				if(tagSifter.test(data)) {
					
					found.push(data);

					break;
				}
			}

		});

		return found;
	}

	//changes {tag:value,tag2:value} to [{tag:value},{tag2:value}]
	var _tagsToArray = function(tagsObj) {
			
		var key, tag, tags = [];

		for(key in tagsObj) {
			
			tag = {};
			tag[key] = tagsObj[key];
			tags.push(tag);

		}

		return tags;
	}


	/**
	 */

	var _andSifter = function(ops, target) {

		var tags = ops.tags || {};

		for(var name in tags) {
			if(tags[name] === true) {
				tags[name] = { $exists: true };
			}
		}

		var $and = _tagsToArray(tags);

		if(ops.siftTags) $and.push(ops.siftTags);

		return sift({ tags: { $and: $and }}, target);

	}

	/**
	 */

	var _chains = function(segments, ops) {
		

		var child  = _rootTree.findChild(segments);

		//route does NOT exist? return a greedy endpoint
		if(!child) {
			return [];//_greedyEndpoint(segments, tags);
		}

		var entireChain = _allCollections(child),

		currentData,

		endCollection = _andSifter(ops)(child.collections.endpoint),

		//the collections expanded with all the explicit / implicit / greedy chains
		expandedChains = [],

		expandedChain;


		//now we need to expand the EXPLICIT chain. Stuff like pass -> thru -> route
		for(var i = 0, n = endCollection.length; i < n; i++) {

			currentData = endCollection[i];
			
			expandedChains.push((ops.expand == undefined || ops.expand == true) ? _chain(currentData, segments, entireChain, ops.throwErrors) : [currentData]);
		}



		return expandedChains;
	};

	var _chain = function(data, segments, entireChain, throwErrors) {

		var tags = data.tags;

		var chain = _siftChain(tags, entireChain);


		var usedGreedyPaths = {};


		//filter out any greedy middleware that's used more than once. This can cause problems
		//for greedy middleware such as /**
		return _expand(chain.concat(data), segments, throwErrors).filter(function(route) {

			if(route.type != 'greedy') return true;
			if(usedGreedyPaths[route.id]) return false;
			return usedGreedyPaths[route.id] = true;

		});
	}

	var _greedyEndpoint = function(segments, tags) {
		
		var tree;

		for(var i = segments.length; i--;) {
			if(tree = _rootTree.findChild(segments.slice(0, i))) break;	
		}

		if(!tree) return [];

		var chain = _siftChain(tags || {}, _greedyCollections(tree));

		return chain;

	}

	var _copy = function(target) {
		var to = {};
		for(var i in target) {
			to[i] = target[i];
		}
		return to;
	}

	/**
	 */

	var _expand = function(chain, segments, throwErrors) {
		
		var j, n2,  i = 0, n = chain.length;


		var expanded = [];


		for(; i < n; i++) {
			
			var data = chain[i];

			var params = _params(data.segments, segments),
			subChain = [];
			
			for(j = 0, n2 = data.thru.length; j < n2; j++) {
					
				subChain.push(_thru(_fillPaths(data.thru[j], params), data.tags, throwErrors));

			}

			expanded = expanded.concat.apply(expanded, subChain);

			expanded.push({
				routeStr: data.routeStr,
				segments: data.segments,
				cmpSegments: segments,
				params: params,
				id: data.id,
				tags: data.tags,
				value: data.value,
				type: data.type
			});
		}

		return expanded;
	}


	/**
	 */

	var _siftChain = function(tags, target) {

		var usable = [], prev;

		//used for greedy middleware - this is especially important for items that do this:
		// -perm /**
		// -perm -unfilterable todos/**
		// -method=GET todos

		//NOTE: we *cannot* use prev-tags for this. This wouldn't work:
		//-perm /**
		//a/**
		//-perm -unfilterable a/b/**
		//-method=GET a/b/c
		toFind = _.extend({}, tags);



		for(var i = target.length; i--;) {

			var a  = target[i],
			atags  = a.tags,
			canUse = true;



			if(a.greedy) {


				//examples of this:
				//-method a/**
				//-method=POST a  --- a/** -> a
				//a --- a (would not go through a/**)
				if(!atags.unfilterable) {
					for(var tagName in atags) {


						av = atags[tagName];
						tv = toFind[tagName];

						//MUST have a value - atags

						//Example:

						//-method=POST a/**

						//matches: 
						//-method=POST a

						//does not match:
						//-method a

						if(av != tv && (!tv || av !== true) && av != '*')  {

							canUse = false;
							break;
						}
					}
				}

			} else {



				for(var tagName in tags) {

					var tv = tags[tagName],
					av     = atags[tagName];

						

					//"-m=a a" matches: "-m=a a/+", "-m a", "a", "-b a"
					//"-m=a a" does NOT match: "-m=b a/+"
					if(tv != av && av !== undefined && av !== true) { 
						canUse = false;
						break;
					}
				}

			}

			if(canUse) {
				_.extend(toFind, atags);
				usable.unshift(a);
			}
		}

		return usable;
	}

	var _doesNotExist = function(segments) {
		throw new Error("route " + crema.stringifySegments(segments, null, true) + " does not exist");
	}


	/**
	 */

	var _thru = function(segments, tags, throwErrors) {

		var child  = _rootTree.findChild(segments);

		if(!child) {
			if(throwErrors) {
				_doesNotExist(segments);
			}
			return [];
		}


		//need to sort the tags because a match for say.. method=DELETE matches both method, and method=DELETE
		//NOTE - chainSifter was previously used here. Since it's EXPLICIT, we do NOT want to filter out the routes.
		var filteredChildren = child.collections.endpoint.sort(function(a, b) {

			return _scoreTags(a.tags, tags) > _scoreTags(b.tags, tags) ? -1 : 1;

		});

		var targetChild = filteredChildren[0];


		var chain = _siftChain(targetChild.tags, _allCollections(child));


		//return only ONE item to go through - this is the best match.
		return _expand(chain.concat(targetChild), segments, throwErrors);
	}

	/**
	 * ranks data based on how similar tags are
	 */

	var _scoreTags = function(tags, match) {
		var score = 0;


		for(var tag in match) {

			var tagV = tags[tag];

			if(tagV == match[tag]) {

				score += 2;

			} else 
			if(tagV) {

				score += 1;

			}
		}

		return score;
	}


	/**
	 * hydrates chain, e.g.,  validate/:firstName -> add/user/:firstName
	 */

	var _fillPaths = function(segments, params) {
		var i, path, n = segments.length, newPaths = [];

		for(i = 0; i < n; i++) {
			
			path = segments[i];

			newPaths.push({
				value: path.param ? params[path.value] : path.value,
				param: path.param
			});
		}

		return newPaths;
	}

	/**
	 * returns the parameters associated with the found path against the queried path, e.g., add/:name/:last and add/craig/condon 
	 */

	var _params = function(treePaths, queryPaths) {
		
		var i, treePath, queryPath, params = {};

		for(i = treePaths.length; i--;) {

			treePath = treePaths[i];
			queryPath = queryPaths[i];

			if(treePath.param) {

				params[treePath.value] = queryPath.value;

			}

		}


		return params;
	};

	/**
	 */

	var _greedyCollections = function(tree) {
		
		var currentParent = tree,
		collections = [],
		gcol = [],
		cpath;

		while(currentParent) {
			 
			cpath = currentParent.pathStr();
			collections = currentParent.collections.greedy.concat(collections);

			currentParent = currentParent.parent();
		}

		return collections;
	};

	/**
	 */

	var _allCollections = function(tree) {
		
		return _greedyCollections(tree).concat(tree.collections.extend);

	}


	/**
	 * finds the deepest tree associated with the given segments
	 */


	var _findTree = function(segments, createIfNotFound) {
		
		var i, path, n = segments.length, currentTree = _rootTree;

		for(i = 0; i < n; i++) {
			
			path = segments[i];

			if(!(currentTree = currentTree.child(path, createIfNotFound))) break;

		}

		return currentTree;

	};



	return self;
}


});

_sardines.register("/modules/beanpoll/lib/collections/linkedList.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var LinkedList;

  module.exports = LinkedList = (function() {

    function LinkedList() {}

    /*
    */

    LinkedList.prototype.getNextSibling = function() {
      return this._nextSibling;
    };

    /*
    */

    LinkedList.prototype.addNextSibling = function(sibling, replNext) {
      if (!!this._nextSibling) this._nexSibling._prevSibling = sibling;
      sibling._prevSibling = this;
      if (!replNext) sibling._nextSibling = this._nextSibling;
      return this._nextSibling = sibling;
    };

    /*
    */

    LinkedList.prototype.getPrevSibling = function() {
      return this._prevSibling;
    };

    /*
    */

    LinkedList.prototype.addPrevSibling = function(sibling, replPrev) {
      if (!!this._prevSibling) this._prevSibling._nextSibling = sibling;
      sibling._nextSibling = this;
      if (!replPrev) sibling._prevSibling = this._prevSibling;
      return this._prevSibling = sibling;
    };

    /*
    */

    LinkedList.prototype.getFirstSibling = function() {
      var first;
      first = this;
      while (!!first._prevSibling) {
        first = first._prevSibling;
      }
      return first;
    };

    /*
    */

    LinkedList.prototype.getLastSibling = function() {
      var last;
      last = this;
      while (!!last._nextSibling) {
        last = last._nextSibling;
      }
      return last;
    };

    return LinkedList;

  })();

}).call(this);

});

_sardines.register("/modules/stream", function(require, module, exports, __dirname, __filename) {
	// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var events = require('events');
var util = require('util');

function Stream() {
  events.EventEmitter.call(this);
}
util.inherits(Stream, events.EventEmitter);
module.exports = Stream;
// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    // remove the listeners
    cleanup();

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    // remove the listeners
    cleanup();

    dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};


});

_sardines.register("/modules/beanpoll/lib/push/messenger.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Messenger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Messenger = require("../concrete/messenger");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype._next = function(middleware) {
      return middleware.listener.call(this, this.request.query, this);
    };

    /*
    	 ack on end
    */

    _Class.prototype._onEnd = function() {
      return this.response.end();
    };

    return _Class;

  })(Messenger);

}).call(this);

});

_sardines.register("/modules/beanpoll/lib/pull/messenger.js", function(require, module, exports, __dirname, __filename) {
	(function() {
  var Messenger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Messenger = require("../concrete/messenger");

  module.exports = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    */

    _Class.prototype.start = function() {
      this.response.req = this.request;
      return _Class.__super__.start.call(this);
    };

    /*
    */

    _Class.prototype._next = function(middleware) {
      return middleware.listener.call(this, this.request, this.response, this);
    };

    /*
    */

    _Class.prototype._onError = function(error) {
      return this.response.error(error);
    };

    return _Class;

  })(Messenger);

}).call(this);

});

_sardines.register("/modules/dolce/lib/tree.js", function(require, module, exports, __dirname, __filename) {
	var crema = require('crema');

var tree = module.exports = function(ops) {

	//ops doesn't exist? it's the root
	if(!ops) ops = { name: '', 
	param: false, 
	parent: null,
	depth: 0,
	deepest: 0};

	//child trees
	var _children = {},

	//THIS tree
	self = {},

	//parent tree obj
	_parent = ops.parent,

	//the root tree /
	_root   = ops.root || self,

	//collections added to this tree?
	_hasListeners = false,

	//the path value to THIS tree object
	_path   = { value: ops.name, param: ops.param },

	//used for debugging
	_pathStr = _parent ? _parent.path().value + '/' + ops.name : '/',

	//string rep of path to the tree
	_segments = _parent ? _parent.segments().concat(_path) : [_path],

	_pathStr = crema.stringifySegments(_segments);

	self.collections = {

		//chain is path/**, which means everything *after* path is handled by this route, which
		//means we need to fetch the parent chain
		greedy: [],

		greedyExtend: [],

		//handled before after
		extend: [],

		//handled last
		endpoint: []
	};



	var _addListener = self.addListener = function(type, data) {
		
		var collections = self.collections[type];
		data.path       = _pathStr;
		data.type       = type;

		if(type.indexOf('greedy') > -1) data.greedy = true;

		collections.push(data);

		_hasListeners = true;

		return {

			/**
			 * removes the data from the collection
			 */

			dispose: function() {
				
				var i = collections.indexOf(data);

				//make sure the data exists before removing it from the collection
				if(i > -1) collections.splice(i, 1);

			}
		}
	}

	var _greedyListeners = function() {

		if(!_parent) return [];
	}

	/**
	 * traverse the tree
	 */

	self.traverse = function(callback) {
		callback(this);

		for(var name in _children) {
			_children[name].traverse(callback);
		}
	}


	/**
	 * retrieves a child path
	 */

	self.child = function(path, createIfNotFound) {
		
		//if the path is a parameter, then the NAME is __param as well
		var name = path.param ? '__param' : path.value;

		//return the child if it exists
		if(_children[name]) return _children[name];

		//otherwise, *create* the child 
		if(createIfNotFound) {

			return _children[name] = tree({ name: name,
				param: path.param, 
				parent: self, 
				root: _root,
				depth: ops.depth + 1, 
				deepest: 0 });

		}

		return null;
	}

	/**
	 * finds a child based segments given
	 */

	self.findChild = function(segments) {

		return _findChildren(self, segments, 0);
	};


	var _findChild = self._findChild = function(segments, index, weighTowardsParam) {

		var currentPath, foundChild, childTree;

		//are we at the end?
		if(segments.length - index == 0) {

			return _hasListeners ? self : null;

		}

		currentPath = segments[index];

		//if we're weighing for parameters, then a route has not been defined
		//for the given path
		if(!weighTowardsParam || !(childTree = _children.__param)) {

			childTree = _children[currentPath.value];

		}


		return childTree ? _findChildren(childTree, segments, index + 1) : null;
	}


	var _findChildren = function(tree, segments, index) {
		
		if(!tree) return null;

		// var param = segments[index] ? segments[index].param : false, found;

		var found;

		//SUPER NOTE:
		// before we'd check if there was a parameter. IF there was then we'd skip the weight towards a non-param route.
		// This is counter-intuitive. IF i have routes:
		// make/task
		// make/web
		// make/:something
		// and I call: make/:something -> makeIt, with :something as "task", I'd expect to hit the explicit "make/task" route vs the parameter.
		//

		if(found = tree._findChild(segments, index, false)) return found;


		return  tree._findChild(segments, index, true);
	}


	/**
	 * returns the current parent
	 */

	self.parent = function() {

		return _parent;

	};

	self.path = function() {
		
		return _path;
	}

	self.pathStr = function() {
		
		return _pathStr;

	}

	self.segments = function() {

		return _segments;
		
	}



	return self;
}
});

_sardines.register("/modules/sift/sift.js", function(require, module, exports, __dirname, __filename) {
	/*
 * Sift
 * 
 * Copryright 2011, Craig Condon
 * Licensed under MIT
 *
 * Inspired by mongodb's query language 
 */


(function() {


	

	var _queryParser = new (function() {

		/**
		 * tests against data
		 */

		var test = this.test = function(statement, data) {

			var exprs = statement.exprs;


			//generally, expressions are ordered from least efficient, to most efficient.
			for(var i = 0, n = exprs.length; i < n; i++) {

				var expr = exprs[i];


				if(!expr.e(expr.v, _comparable(data), data)) return false;

			}

			return true;
		}


		/**
		 * parses a statement into something evaluable
		 */

		var parse = this.parse = function(statement, key) {

			var testers = [];
				
			if(statement)
			//if the statement is an object, then we're looking at something like: { key: match }
			if(statement.constructor == Object) {

				for(var k in statement) {

					//find the apropriate operator. If one doesn't exist, then it's a property, which means
					//we create a new statement (traversing) 
					var operator = !!_testers[k] ?  k : '$trav',

					//value of given statement (the match)
					value = statement[k],

					//default = match
					exprValue = value;

					//if we're working with a traversable operator, then set the expr value
					if(TRAV_OP[operator]) {
						
						//*if* the value is an array, then we're dealing with something like: $or, $and
						if(value instanceof Array) {
							
							exprValue = [];

							for(var i = value.length; i--;) {

								exprValue.push(parse(value[i]));
									
							}

						//otherwise we're dealing with $trav
						} else {
							
							exprValue = parse(statement[k], k);

						}
					} 
					

					testers.push(_getExpr(operator, k, exprValue));

				}
								

			//otherwise we're comparing a particular value, so set to eq
			} else {

				testers.push(_getExpr('$eq', k, statement));

			}

			var stmt =  { 

				exprs: testers,
				k: key,
				test: function(value) {
					
					return test(stmt, value);

				} 

			};
			
			return stmt;
		
		}


		//traversable statements
		var TRAV_OP = {

			$and: true,
			$or: true,
			$nor: true,
			$trav: true,
			$not: true

		}


		function _comparable(value) {

			if(value instanceof Date) {

				return value.getTime();
			
			} else {

				return value;
			
			}
		}


		var _testers = {

			/**
			 */

			$eq: function(a, b) {

				return a.test(b);

			},

			/**
			 */

			$ne: function(a, b) {

				return !a.test(b);

			},

			/**
			 */

			$lt: function(a, b) {

				return a > b;

			},

			/**
			 */

			$gt: function(a, b) {

				return a < b;

			},

			/**
			 */

			$lte: function(a, b) {

				return a >= b;

			},

			/**
			 */

			$gte: function(a, b) {

				return a <= b;

			},


			/**
			 */

			$exists: function(a, b) {

				return a == !!b;

			},

			/**
			 */

			$in: function(a, b) {

				//intersecting an array
				if(b instanceof Array) {

					for(var i = b.length; i--;) {

						if(a.indexOf(b[i]) > -1) return true;

					}	

				} else {

					return a.indexOf(b) > -1;

				}

			},

			/**
			 */

			$not: function(a, b) {
				return !a.test(b);
			},

			/**
			 */

			$type: function(a, b, org) {

				//instanceof doesn't work for strings / boolean. instanceof works with inheritance
				return org ? org instanceof a || org.constructor == a : false;

			},

			/**
			 */


			$nin: function(a, b) {

				return !_testers.$in(a, b);

			},

			/**
			 */

			$mod: function(a, b) {

				return b % a[0] == a[1];

			},

			/**
			 */

			$all: function(a, b) {


				for(var i = a.length; i--;) {

					var v = a[i];

					if(b.indexOf(v) == -1) return false;

				}

				return true;

			},

			/**
			 */

			$size: function(a, b) {

				return b ? a == b.length : false;

			},

			/**
			 */

			$or: function(a, b) {

				var i = a.length, n = i;

				for(; i--;) {

					if(test(a[i], b)) {

						return true;

					}

				}

				return !n;

			},

			/**
			 */

			$nor: function(a, b) {

				var i = a.length, n = i;

				for(; i--;) {

					if(!test(a[i], b)) {

						return true;

					}

				}

				return !n;

			},

			/**
			 */

			$and: function(a, b) {

				for(var i = a.length; i--;) {

					if(!test(a[i], b)) {

						return false;

					}
				}

				return true;
			},

			/**
			 */

			$trav: function(a, b) {

				if(b instanceof Array) {
					
					for(var i = b.length; i--;) {
						
						var subb = b[i];

						if(subb[a.k] && test(a, subb[a.k])) return true;

					}

					return false;
				}


				return b ? test(a, b[a.k]) : false;

			}
		}

		var _prepare = {
			
			/**
			 */

			$eq: function(a) {
				
				var fn;

				if(a instanceof RegExp) {

					return a;

				} else if (a instanceof Function) {

					fn = a;

				} else {
					
					fn = function(b) {

						return a == b;
					}

				}

				return {

					test: fn

				}

			},
			
			/**
			 */
				
			 $ne: function(a) {
				return _prepare.$eq(a);
			 }
		};



		var _getExpr = function(type, key, value) {

			var v = _comparable(value);

			return { 

				//type
				// t: type,

				//k key
				k: key, 

				//v value
				v: _prepare[type] ? _prepare[type](v) : v, 

				//e eval
				e: _testers[type] 
			};

		}


	})();

	var sifter = function(query) {

		//build the filter for the sifter
		var filter = _queryParser.parse( query );
			
		//the function used to sift through the given array
		var self = function(target) {
				
			var sifted = [];

			//I'll typically start from the end, but in this case we need to keep the order
			//of the array the same.
			for(var i = 0, n = target.length; i < n; i++) {

				if(filter.test( target[i] )) sifted.push(target[i]);

			}

			return sifted;
		}

		//set the test function incase the sifter isn't needed
		self.test   = filter.test;
		self.query  = query;

		return self;
	}


	//sifts a given array
	var sift = function(query, target) {


		var sft = sifter(query);

		//target given? sift through it and return the filtered result
		if(target) return sft(target);

		//otherwise return the sifter func
		return sft;

	}


	//node.js?
	if((typeof module != 'undefined') && (typeof module.exports != 'undefined')) {
		
		module.exports = sift;

	} else 

	//browser?
	if(typeof window != 'undefined') {
		
		window.sift = sift;

	}

})();


});

_sardines.register("/modules/sift", function(require, module, exports, __dirname, __filename) {
	module.exports = require('modules/sift/sift.js');
});

_sardines.register("/modules/util", function(require, module, exports, __dirname, __filename) {
	// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var events = require('events');


var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      case '%%': return '%';
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}


exports.print = function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(String(arguments[i]));
  }
};


exports.puts = function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
};


exports.debug = function(x) {
  process.binding('stdio').writeError('DEBUG: ' + x + '\n');
};


var error = exports.error = function(x) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.binding('stdio').writeError(arguments[i] + '\n');
  }
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: colors ? stylizeWithColor : stylizeNoColor
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
var colors = {
   'bold' : [1, 22],
   'italic' : [3, 23],
   'underline' : [4, 24],
   'inverse' : [7, 27],
   'white' : [37, 39],
   'grey' : [90, 39],
   'black' : [30, 39],
   'blue' : [34, 39],
   'cyan' : [36, 39],
   'green' : [32, 39],
   'magenta' : [35, 39],
   'red' : [31, 39],
   'yellow' : [33, 39]
};

var styles = {
   'special': 'cyan',
   'number': 'blue',
   'boolean': 'yellow',
   'undefined': 'grey',
   'null': 'bold',
   'string': 'green',
   'date': 'magenta',
   // "name": intentionally not styling
   'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = styles[styleType];

  if (style) {
    return '\033[' + colors[style][0] + 'm' + str +
           '\033[' + colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}





function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && objectToString(re) === '[object RegExp]');
}


function isDate(d) {
  return d instanceof Date ||
    (typeof d === 'object' && objectToString(d) === '[object Date]');
}


function isError(e) {
  return e instanceof Error ||
    (typeof e === 'object' && objectToString(e) === '[object Error]');
}


function objectToString(o) {
  return Object.prototype.toString.call(o);
}


var pWarning;

exports.p = function() {
  if (!pWarning) {
    pWarning = 'util.p will be removed in future versions of Node. ' +
               'Use util.puts(util.inspect()) instead.\n';
    exports.error(pWarning);
  }
  for (var i = 0, len = arguments.length; i < len; ++i) {
    error(exports.inspect(arguments[i]));
  }
};


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


exports.log = function(msg) {
  exports.puts(timestamp() + ' - ' + msg.toString());
};


var execWarning;


exports.pump = function(readStream, writeStream, callback) {
  var callbackCalled = false;

  function call(a, b, c) {
    if (callback && !callbackCalled) {
      callback(a, b, c);
      callbackCalled = true;
    }
  }

  if (!readStream.pause) {
    readStream.pause = function() {readStream.emit('pause');};
  }

  if (!readStream.resume) {
    readStream.resume = function() {readStream.emit('resume');};
  }

  readStream.addListener('data', function(chunk) {
    if (writeStream.write(chunk) === false) readStream.pause();
  });

  writeStream.addListener('pause', function() {
    readStream.pause();
  });

  writeStream.addListener('drain', function() {
    readStream.resume();
  });

  writeStream.addListener('resume', function() {
    readStream.resume();
  });

  readStream.addListener('end', function() {
    writeStream.end();
  });

  readStream.addListener('close', function() {
    call();
  });

  readStream.addListener('error', function(err) {
    writeStream.end();
    call(err);
  });

  writeStream.addListener('error', function(err) {
    readStream.destroy();
    call(err);
  });
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be revritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

});

var entries = ["modules/beanpoll/lib/index.js"],
	module = {},
	process = {
		title: 'browser'
	}

for(var i = entries.length; i--;)
{
	var entry = _sardines.require(entries[i]);

	for(var property in entry)
	{
		module[property] = entry[property];
	}
}

return module;
})();


if(typeof module != 'undefined') module.exports = __app;