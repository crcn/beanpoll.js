var sardModule0 = {}; 
var Structr = function(fhClass, parent) {
    if (!parent) parent = Structr.fh({});
    var that = Structr.extend(parent, fhClass);
    if (!that.__construct) {
        that.__construct = function() {};
    }
    that.__construct.prototype = that;
    that.__construct.extend = function(child) {
        return Structr(child, that);
    };
    return that.__construct;
};

Structr.copy = function(from, to, lite) {
    if (typeof to == "boolean") {
        lite = to;
        to = undefined;
    }
    if (!to) to = {};
    var i;
    for (i in from) {
        var fromValue = from[i], toValue = to[i], newValue;
        if (!lite && typeof fromValue == "object") {
            if (toValue && fromValue instanceof toValue.constructor) {
                newValue = toValue;
            } else {
                newValue = fromValue instanceof Array ? [] : {};
            }
            Structr.copy(fromValue, newValue);
        } else {
            newValue = fromValue;
        }
        to[i] = newValue;
    }
    return to;
};

Structr.getMethod = function(that, property) {
    return function() {
        return that[property].apply(that, arguments);
    };
};

Structr.findProperties = function(target, modifier) {
    var props = [], property;
    for (property in target) {
        var v = target[property];
        if (v && v[modifier]) {
            props.push(property);
        }
    }
    return props;
};

Structr.nArgs = function(func) {
    var inf = func.toString().replace(/\{[\W\S]+\}/g, "").match(/\w+(?=[,\)])/g);
    return inf ? inf.length : 0;
};

Structr.getFuncsByNArgs = function(that, property) {
    return that.__private["overload::" + property] || (that.__private["overload::" + property] = {});
};

Structr.getOverloadedMethod = function(that, property, nArgs) {
    var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
    return funcsByNArgs[nArgs];
};

Structr.setOverloadedMethod = function(that, property, func, nArgs) {
    var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
    if (func.overloaded) return funcsByNArgs;
    funcsByNArgs[nArgs || Structr.nArgs(func)] = func;
    return funcsByNArgs;
};

Structr.modifiers = {
    m_override: function(that, property, newMethod) {
        var oldMethod = that.__private && that.__private[property] || that[property] || function() {}, parentMethod = oldMethod;
        if (oldMethod.overloaded) {
            var overloadedMethod = oldMethod, nArgs = Structr.nArgs(newMethod);
            parentMethod = Structr.getOverloadedMethod(that, property, nArgs);
        }
        var wrappedMethod = function() {
            this._super = parentMethod;
            var ret = newMethod.apply(this, arguments);
            delete this._super;
            return ret;
        };
        if (oldMethod.overloaded) {
            return Structr.modifiers.m_overload(that, property, wrappedMethod, nArgs);
        }
        return wrappedMethod;
    },
    m_explicit: function(that, property, gs) {
        var pprop = "__" + property;
        if (typeof gs != "object") {
            gs = {};
        }
        if (!gs.get) gs.get = function() {
            return this._value;
        };
        if (!gs.set) gs.set = function(value) {
            this._value = value;
        };
        return function(value) {
            if (!arguments.length) {
                this._value = this[pprop];
                var ret = gs.get.apply(this);
                delete this._value;
                return ret;
            } else {
                if (this[pprop] == value) return;
                this._value = this[pprop];
                gs.set.apply(this, [ value ]);
                this[pprop] = this._value;
            }
        };
    },
    m_implicit: function(that, property, egs) {
        that.__private[property] = egs;
        that.__defineGetter__(property, egs);
        that.__defineSetter__(property, egs);
    },
    m_overload: function(that, property, value, nArgs) {
        var funcsByNArgs = Structr.setOverloadedMethod(that, property, value, nArgs);
        var multiFunc = function() {
            var func = funcsByNArgs[arguments.length];
            if (func) {
                return funcsByNArgs[arguments.length].apply(this, arguments);
            } else {
                var expected = [];
                for (var sizes in funcsByNArgs) {
                    expected.push(sizes);
                }
                throw new Error("Expected " + expected.join(",") + " parameters, got " + arguments.length + ".");
            }
        };
        multiFunc.overloaded = true;
        return multiFunc;
    }
};

Structr.extend = function(from, to) {
    if (!to) to = {};
    var that = {
        __private: {
            propertyModifiers: {}
        }
    };
    if (to instanceof Function) to = to();
    Structr.copy(from, that);
    var usedProperties = {}, property;
    for (property in to) {
        var value = to[property];
        var propModifiersAr = property.split(" "), propertyName = propModifiersAr.pop(), modifierList = that.__private.propertyModifiers[propertyName] || (that.__private.propertyModifiers[propertyName] = []);
        if (propModifiersAr.length) {
            var propModifiers = {};
            for (var i = propModifiersAr.length; i--; ) {
                var modifier = propModifiersAr[i];
                propModifiers["m_" + propModifiersAr[i]] = 1;
                if (modifierList.indexOf(modifier) == -1) {
                    modifierList.push(modifier);
                }
            }
            if (propModifiers.m_explicit || propModifiers.m_implicit) {
                value = Structr.modifiers.m_explicit(that, propertyName, value);
            }
            if (propModifiers.m_override) {
                value = Structr.modifiers.m_override(that, propertyName, value);
            }
            if (propModifiers.m_implicit) {
                Structr.modifiers.m_implicit(that, propertyName, value);
                continue;
            }
        }
        for (var j = modifierList.length; j--; ) {
            value[modifierList[j]] = true;
        }
        if (usedProperties[propertyName]) {
            var oldValue = that[propertyName];
            if (!oldValue.overloaded) Structr.modifiers.m_overload(that, propertyName, oldValue, undefined);
            value = Structr.modifiers.m_overload(that, propertyName, value, undefined);
        }
        usedProperties[propertyName] = 1;
        that.__private[propertyName] = that[propertyName] = value;
    }
    if (that.__construct && from.__construct && that.__construct == from.__construct) {
        that.__construct = Structr.modifiers.m_override(that, "__construct", function() {
            this._super.apply(this, arguments);
        });
    }
    var propertyName;
    for (propertyName in that) {
        var value = that[propertyName];
        if (value && value["static"]) {
            that.__construct[propertyName] = value;
            delete that[propertyName];
        }
    }
    return that;
};

Structr.fh = function(that) {
    that = Structr.extend({}, that);
    that.getMethod = function(property) {
        return Structr.getMethod(this, property);
    };
    that.extend = function(target) {
        return Structr.extend(this, target);
    };
    that.copyTo = function(target, lite) {
        Structr.copy(this, target, lite);
    };
    return that;
};

sardModule0 = Structr;
var sardModule6 = {}; 
var sardVar5 = sardModule0;

var Token = {
    WORD: 1,
    METADATA: 1 << 1,
    NUMBER: 1 << 2,
    PARAM: 1 << 3,
    TO: 1 << 4,
    BACKSLASH: 1 << 5,
    DOT: 1 << 6,
    STAR: 1 << 7,
    OR: 1 << 8,
    LP: 1 << 9,
    RP: 1 << 10,
    EQ: 1 << 11,
    WHITESPACE: 1 << 12
};

var Reversed = {
    or: Token.OR
};

var Tokenizer = function() {
    var source = "", pos = 0, currentToken, self = this;
    this.source = function(value) {
        if (value) {
            source = value + " ";
            pos = 0;
        }
        return source;
    };
    this.next = function(keepWhite) {
        return currentToken = nextToken(keepWhite);
    };
    this.peekChars = function(n) {
        return source.substr(pos, n);
    };
    this.current = function(keepWhite) {
        return currentToken || self.next(keepWhite);
    };
    this.position = function() {
        return pos;
    };
    var nextToken = function(keepWhite) {
        if (!keepWhite) skipWhite();
        if (eof()) return null;
        var c = currentChar(), ccode = c.charCodeAt(0);
        if (isWhite(ccode)) {
            skipWhite();
            return token(" ", Token.WHITESPACE);
        }
        if (isAlpha(ccode)) {
            var w = nextWord();
            return token(w, Reversed[w.toLowerCase()] || Token.WORD);
        }
        if (isNumber(ccode)) {
            return token(nextNumber(), Token.NUMBER);
        }
        switch (c) {
          case "-":
            if (nextChar() == ">") return token("->", Token.TO, true);
            if (isAlpha(currentCharCode())) return token(nextWord(), Token.METADATA);
            error();
          case ":":
            if (isAlpha(nextCharCode())) return token(nextWord(), Token.PARAM);
            error();
          case "/":
            return token("/", Token.BACKSLASH, true);
          case ".":
            return token(".", Token.DOT, true);
          case "*":
            return token("*", Token.STAR, true);
          case "(":
            return token("(", Token.LP, true);
          case ")":
            return token(")", Token.RP, true);
          case "=":
            return token("=", Token.EQ, true);
          default:
            error();
        }
        return null;
    };
    var error = function() {
        throw new Error('Unexpected character "' + currentChar() + '" at position ' + pos + ' in "' + source + '"');
    };
    var token = function(value, type, skipOne) {
        if (skipOne) nextChar();
        return {
            value: value,
            type: type
        };
    };
    var nextChar = this.nextChar = function() {
        return source[++pos];
    };
    var currentChar = this.currentChar = function() {
        return source[pos];
    };
    var isAlpha = this.isAlpha = function(c) {
        return c > 96 && c < 123 || c > 64 && c < 91 || isNumber(c);
    };
    var isWhite = this.isWhite = function(c) {
        return c == 32 || c == 9 || c == 10;
    };
    var isNumber = this.isNumber = function(c) {
        return c > 47 && c < 58;
    };
    var nextCharCode = function() {
        return nextChar().charCodeAt(0);
    };
    var currentCharCode = function() {
        return currentChar().charCodeAt(0);
    };
    var rewind = function(steps) {
        pos -= steps || 1;
    };
    var skipWhite = function() {
        var end = false;
        while (!(end = eof())) {
            if (!isWhite(currentCharCode())) break;
            nextChar();
        }
        return !end;
    };
    var nextNumber = function() {
        var buffer = currentChar();
        while (!eof()) {
            if (isNumber(nextCharCode())) {
                buffer += currentChar();
            } else {
                break;
            }
        }
        return buffer;
    };
    var nextWord = function() {
        var buffer = currentChar();
        while (!eof()) {
            if (!isWhite(nextCharCode()) && currentChar() != "/" && currentChar() != "=") {
                buffer += currentChar();
            } else {
                break;
            }
        }
        return buffer;
    };
    var eof = function() {
        return pos > source.length - 2;
    };
};

var ChannelParser = function() {
    var tokenizer = new Tokenizer, cache = {};
    this.parse = function(source) {
        if (!source) throw new Error("Source is not defined");
        if (cache[source]) return cache[source];
        tokenizer.source(source);
        return cache[source] = rootExpr();
    };
    var rootExpr = function() {
        var expr = tokenizer.current(), type, meta = {};
        if (expr.type == Token.WORD && tokenizer.isWhite(tokenizer.peekChars(1).charCodeAt(0)) && tokenizer.position() < tokenizer.source().length - 1) {
            type = expr.value;
            tokenizer.next();
        }
        var token, channel;
        while (token = tokenizer.current()) {
            switch (token.type) {
              case Token.METADATA:
                meta[token.value] = metadataValue();
                break;
              case Token.WORD:
              case Token.STAR:
                channel = channelExpr();
                break;
            }
            tokenizer.next();
        }
        return {
            type: type,
            meta: meta,
            channel: channel
        };
    };
    var metadataValue = function() {
        if (tokenizer.currentChar() == "=") {
            tokenizer.next();
            return tokenizer.next().value;
        }
        return 1;
    };
    var channelExpr = function() {
        var channel, to;
        while (hasNext()) {
            channel = channelPathsExpr();
            if (currentTypeIs(Token.TO)) {
                tokenizer.next();
                var oldChannel = channel;
                channel = channelExpr();
                oldChannel.thru = channel.thru;
                channel.thru = oldChannel;
            } else if (currentTypeIs(Token.OR)) {
                tokenizer.next();
                channel.or = channelExpr();
            } else {
                break;
            }
        }
        return channel;
    };
    var channelPathsExpr = function(type) {
        var paths = [], token, isMiddleware = false, cont = true;
        while (cont && (token = tokenizer.current())) {
            switch (token.type) {
              case Token.WORD:
              case Token.PARAM:
              case Token.NUMBER:
                paths.push({
                    name: token.value,
                    param: token.type == Token.PARAM
                });
                break;
              case Token.BACKSLASH:
                break;
              default:
                cont = false;
                break;
            }
            if (cont) tokenizer.next();
        }
        if (currentTypeIs(Token.STAR)) {
            isMiddleware = true;
            tokenizer.next();
        }
        return {
            paths: paths,
            isMiddleware: isMiddleware
        };
    };
    var currentToken = function(type, igError) {
        return checkToken(tokenizer.current(), type, igError);
    };
    var nextToken = function(type, igError, keepWhite) {
        return checkToken(tokenizer.next(keepWhite), type, igError);
    };
    var checkToken = function(token, type, igError) {
        if (!token || !(type & token.type)) {
            if (!igError) throw new Error('Unexpected token "' + (token || {}).value + '" at position ' + tokenizer.position() + " in " + tokenizer.source());
            return null;
        }
        return token;
    };
    var currentTypeIs = function(type) {
        var current = tokenizer.current();
        return current && !!(type & current.type);
    };
    var hasNext = function() {
        return !!tokenizer.current();
    };
};

sardModule6.parse = (new ChannelParser).parse;
var sardModule8 = {}; 
sardModule8.replaceParams = function(expr, params) {
    var path;
    for (var i = expr.channel.paths.length; i--; ) {
        path = expr.channel.paths[i];
        if (path.param) {
            path.param = false;
            path.name = params[path.name];
            if (!path.name) expr.channel.paths.splice(i, 1);
        }
    }
    return expr;
};

sardModule8.pathToString = function(path) {
    var paths = [];
    for (var i = 0, n = path.length; i < n; i++) {
        var pt = path[i];
        paths.push(pt.param ? ":" + pt.name : pt.name);
    }
    return paths.join("/");
};

sardModule8.passThrusToArray = function(expr) {
    var cpt = expr.thru, thru = [];
    while (cpt) {
        thru.push(this._pathToString(cpt.paths));
        cpt = cpt.thru;
    }
    return thru;
};
var sardModule11 = {}; 
sardModule11.rotator = function(target, meta) {
    if (!target) target = {};
    target.meta = [ meta ];
    target.allowMultiple = true;
    target.getRoute = function(ops) {
        var route = ops.route, listeners = ops.listeners;
        if (!ops.router._allowMultiple && route && route.meta && route.meta[meta] != undefined && listeners.length) {
            route.meta[meta] = ++route.meta[meta] % listeners.length;
            ops.listeners = [ listeners[route.meta[meta]] ];
        }
    };
    target.setRoute = function(ops) {};
};

sardModule11.rotator(sardModule11, "rotate");
var sardModule13 = {}; 
var sardVar10 = sardModule0;

sardModule13 = function() {
    var mw = new sardModule13.Middleware;
    mw.add(sardModule11);
    return mw;
};

sardModule13.Middleware = sardVar10({
    __construct: function() {
        this._toMetadata = {};
        this._universal = {};
    },
    add: function(module) {
        var self = this;
        if (module.all) {
            module.all.forEach(function(type) {
                if (!self._universal[type]) self._universal[type] = [];
                self._universal[type].push(module);
            });
        }
        module.meta.forEach(function(name) {
            self._toMetadata[name] = module;
        });
    },
    getRoute: function(ops) {
        var mw = this._getMW(ops.route ? ops.route.meta : {}, "getRoute").concat(this._getMW(ops.expr.meta));
        return this._eachMW(ops, mw, function(cur, ops) {
            return cur.getRoute(ops);
        });
    },
    setRoute: function(ops) {
        var mw = this._getMW(ops.meta, "setRoute");
        return this._eachMW(ops, mw, function(cur, ops) {
            return cur.setRoute(ops);
        });
    },
    allowMultiple: function(expr) {
        var mw = this._getMW(expr.meta);
        for (var i = mw.length; i--; ) {
            if (mw[i].allowMultiple) return true;
        }
        return false;
    },
    _getMW: function(meta, uni) {
        var mw = (this._universal[uni] || []).concat();
        for (var name in meta) {
            var handler = this._toMetadata[name];
            if (handler && mw.indexOf(handler) == -1) mw.push(handler);
        }
        return mw;
    },
    _eachMW: function(ops, mw, each) {
        var cops = ops, newOps;
        for (var i = mw.length; i--; ) {
            if (newOps = each(mw[i], cops)) {
                cops = newOps;
            }
        }
        return cops;
    }
});
var sardModule17 = {}; 
var sardVar15 = sardModule0, sardVar16 = sardModule6;

var Request = sardVar15({
    __construct: function(listener, batch) {
        this.data = batch.data;
        this.router = batch.router;
        this.callback = batch.callback;
        this._used = {};
        this._add(listener, this.data);
    },
    init: function() {
        return this;
    },
    next: function() {
        if (this._queue.length) {
            var thru = this._queue.pop(), target = thru.target;
            if (target.paths) {
                var route = this.router.getRoute({
                    channel: target
                });
                this._addListeners(route.listeners, route.data);
                return this.next();
            }
            if (this._used[target.id]) return this.next();
            this._used[target.id] = thru;
            this._prepare(target, thru.data);
            return true;
        }
        return false;
    },
    _addListeners: function(listeners, data) {
        if (listeners instanceof Array) {
            for (var i = listeners.length; i--; ) {
                this._add(listeners[i], data);
            }
            return;
        }
    },
    _add: function(route, data) {
        if (!this._queue) this._queue = [];
        var current = route, _queue = this._queue;
        while (current) {
            _queue.push({
                target: current,
                data: data
            });
            current = current.thru;
        }
    },
    _prepare: function(target, data) {
        for (var index in data._params) {
            var v = target.path[index];
            if (!v) break;
            var iname = target.path[index].name;
            this.data[iname] = data[iname] = data._params[index];
        }
        this._callback(target, data);
    },
    _callback: function(target, data) {
        return target.callback.call(this, this);
    }
});

sardModule17 = Request;
var sardModule23 = {}; 
var sardVar19 = sardModule0, sardVar20 = sardModule6, sardVar21 = sardModule8, sardVar22 = sardModule17;

var Collection = sardVar19({
    __construct: function(ops) {
        this._ops = ops || {};
        this._routes = this._newRoute();
        this._middleware = this._newRoute();
        this._routeIndex = 0;
    },
    has: function(expr) {
        return !!this.route(expr).target;
    },
    route: function(expr) {
        return this._route(expr.channel.paths);
    },
    add: function(expr, callback) {
        var paths = expr.channel.paths, isMiddleware = expr.channel.isMiddleware, middleware = expr.channel.thru, currentRoute = this._start(paths, isMiddleware ? this._middleware : this._routes);
        var before = this._before(paths, currentRoute);
        if (middleware) this._endMiddleware(middleware).thru = before;
        var listener = {
            callback: callback,
            meta: expr.meta,
            id: "r" + this._routeIndex++,
            thru: middleware || before,
            path: paths
        };
        currentRoute.meta = sardVar19.copy(expr.meta, currentRoute.meta);
        if (isMiddleware) this._injectMiddleware(listener, paths);
        if (!currentRoute.listeners) currentRoute.listeners = [];
        currentRoute.listeners.push(listener);
        return {
            dispose: function() {
                var i = currentRoute.listeners.indexOf(listener);
                if (i > -1) currentRoute.listeners.splice(i, 1);
            }
        };
    },
    _endMiddleware: function(target) {
        var current = target || {};
        while (current.thru) {
            current = current.thru;
        }
        return current;
    },
    _injectMiddleware: function(listener, paths) {
        listener.level = paths.length;
        var afterListeners = this._after(paths, this._routes).concat(this._after(paths, this._middleware));
        for (var i = afterListeners.length; i--; ) {
            var currentListener = afterListeners[i];
            var currentMiddleware = currentListener.thru, previousMiddleware = currentListener;
            while (currentMiddleware) {
                if (currentMiddleware.level != undefined) {
                    if (currentMiddleware.level < listener.level) {
                        previousMiddleware.thru = listener;
                    }
                    break;
                }
                previousMiddleware = currentMiddleware;
                currentMiddleware = currentMiddleware.thru;
            }
            if (!currentMiddleware) previousMiddleware.thru = listener;
        }
    },
    _before: function(paths, after) {
        var current = this._middleware._route, listeners = [];
        for (var i = 0, n = paths.length; i < n; i++) {
            if (current.listeners) listeners = current.listeners;
            var path = paths[i], newCurrent = path.param ? current._param : current[path.name];
            if (!newCurrent || !newCurrent._route || !newCurrent._route.listeners) break;
            current = newCurrent._route;
            if (current != after) listeners = current.listeners;
        }
        return listeners[0];
    },
    _after: function(paths, routes) {
        return this._flatten(this._start(paths, routes));
    },
    _route: function(paths, routes, create) {
        var current = (routes || this._routes)._route, data = {};
        for (var i = 0, n = paths.length; i < n; i++) {
            var path = paths[i], name = path.param ? "_param" : path.name;
            if (!current[name] && create) {
                current[name] = this._newRoute(i);
            }
            if (current[name]) {
                current = current[name];
            } else {
                current = current._param;
                if (current) data[i] = name;
            }
            if (!current) return {};
            current = current._route;
        }
        return {
            target: current,
            data: data
        };
    },
    _start: function(paths, routes) {
        return this._route(paths, routes, true).target;
    },
    _newRoute: function(level) {
        return {
            _route: {},
            _level: level || 0
        };
    },
    _flatten: function(route) {
        var listeners = route.listeners ? route.listeners.concat() : [];
        for (var path in route) {
            listeners = listeners.concat(this._flatten(route[path]._route || {}));
        }
        return listeners;
    }
});

sardModule23 = Collection;
var sardModule25 = {}; 
var sardVar4 = sardModule0, sardVar7 = sardModule6, sardVar9 = sardModule8, sardVar14 = sardModule13, sardVar18 = sardModule17, sardVar24 = sardModule23;

var Router = sardVar4({
    __construct: function(ops) {
        if (!ops) ops = {};
        this.RequestClass = ops.RequestClass || sardVar18;
        this._collection = new sardVar24(ops);
        this._allowMultiple = !!ops.multi;
    },
    on: function(expr, callback) {
        if (this.hasRoute(expr) && !this._allowMultiple && !this._middleware().allowMultiple(expr)) {
            throw new Error('Path "' + sardVar9.pathToString(expr.channel.paths) + '" already exists');
        }
        this._middleware().setRoute(expr);
        return this._collection.add(expr, callback);
    },
    _middleware: function() {
        return this.controller.metaMiddleware;
    },
    hasRoute: function(expr, data) {
        return !!this.getRoute(expr, data).listeners.length;
    },
    getRoute: function(expr, data) {
        var route = this._collection.route(expr);
        if (!data) data = {};
        data._params = route.data;
        return this._middleware().getRoute({
            expr: expr,
            router: this,
            route: route.target,
            data: data,
            listeners: this._filterRoute(expr, route.target)
        });
    },
    dispatch: function(expr, data, ops, callback) {
        if (data instanceof Function) {
            callback = data;
            data = undefined;
            ops = undefined;
        }
        if (ops instanceof Function) {
            callback = ops;
            ops = undefined;
        }
        if (!ops) ops = {};
        if (!data) data = {};
        var inf = this.getRoute(expr, data);
        if (!inf.listeners.length) {
            if (!ops.ignoreWarning) console.warn('The %s route "%s" does not exist', expr.type, sardVar9.pathToString(expr.channel.paths));
            if (expr.meta.passive && callback) {
                callback();
            }
            return;
        }
        var newOps = {
            router: this,
            data: inf.data,
            meta: expr.meta,
            from: ops.from || this.controller,
            listeners: inf.listeners,
            callback: callback
        };
        sardVar4.copy(newOps, ops, true);
        this._callListeners(ops);
    },
    _callListeners: function(newOps) {
        for (var i = newOps.listeners.length; i--; ) {
            sardVar4.copy(newOps, new this.RequestClass(newOps.listeners[i], newOps), true).init().next();
        }
    },
    _filterRoute: function(expr, route) {
        if (!route) return [];
        var listeners = (route.listeners || []).concat();
        for (var name in expr.meta) {
            var value = expr.meta[name];
            if (value === 1) continue;
            for (var i = listeners.length; i--; ) {
                var listener = listeners[i];
                if (listener.meta[name] != value) {
                    listeners.splice(i, 1);
                }
            }
        }
        return listeners;
    }
});

sardModule25 = Router;
var sardModule28 = {}; 
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    };
}

if (this.window && !window.console) {
    var console = {
        log: function() {}
    };
}

var sk = {};
var sardModule31 = {}; 
sardModule28;

sardModule31 = sardModule0;
var sardModule33 = {}; 
var sardVar32 = sardModule31;

sardModule33.EventEmitter = {
    __construct: function() {
        this._listeners = {};
    },
    addListener: function(type, callback) {
        (this._listeners[type] || (this._listeners[type] = [])).push(callback);
        var self = this;
        return {
            dispose: function() {
                self.removeListener(type, callback);
            }
        };
    },
    hasEventListener: function(type, callback) {
        return !!this._listeners[type];
    },
    getNumListeners: function(type, callback) {
        return this.getEventListeners(type).length;
    },
    removeListener: function(type, callback) {
        var lists = this._listeners[type], i, self = this;
        if (!lists) return;
        if ((i = lists.indexOf(callback)) > -1) {
            lists.splice(i, 1);
            if (!lists.length) {
                delete self._listeners[type];
            }
        }
    },
    getEventListeners: function(type) {
        return this._listeners[type] || [];
    },
    removeListeners: function(type) {
        delete this._listeners[type];
    },
    removeAllListeners: function() {
        this._listeners = {};
    },
    dispose: function() {
        this._listeners = {};
    },
    emit: function() {
        var args = [], type = arguments[0], lists;
        for (var i = 1, n = arguments.length; i < n; i++) {
            args[i - 1] = arguments[i];
        }
        if (lists = this._listeners[type]) for (var i = lists.length; i--; ) {
            lists[i].apply(this, args);
        }
    }
};

sardModule33.EventEmitter = sardVar32(sardModule33.EventEmitter);
var sardModule35 = {}; 
var sardVar27 = sardModule0, EventEmitter = sardModule33.EventEmitter;

var proto = {
    _init: function(ttl) {
        this._em = new EventEmitter;
        this.response = {};
        if (ttl) {
            this.cache(ttl);
        }
    },
    cache: function(ttl) {
        if (this._caching) return;
        this._caching = true;
        var buffer = this._buffer = [], self = this;
        this.on({
            write: function(chunk) {
                buffer.push(chunk);
            }
        });
    },
    on: function(listeners) {
        for (var type in listeners) {
            this._em.addListener(type, listeners[type]);
        }
    },
    "second on": function(type, callback) {
        this._em.addListener(type, callback);
    },
    respond: function(data) {
        sardVar27.copy(data, this.response, true);
    },
    error: function(data) {
        this._em.emit("error", data);
    },
    write: function(data) {
        if (!this._sentResponse) {
            this.response = JSON.parse(JSON.stringify(this.response));
            this._em.emit("response", this.response);
        }
        this._em.emit("write", data);
    },
    end: function(data) {
        if (data) this.write(data);
        this.finished = true;
        this._em.emit("end", data);
        this._em.dispose();
    },
    pipe: function(stream) {
        if (this._buffer && this._buffer.length) {
            if (stream.response) stream.response = this.response;
            for (var i = 0, n = this._buffer.length; i < n; i++) {
                stream.write(this._buffer[i]);
            }
        }
        if (this.finished) {
            return stream.end();
        }
        this.on({
            write: function(data) {
                stream.write(data);
            },
            end: function() {
                stream.end();
            },
            error: function(e) {
                if (stream.error) stream.error(e);
            },
            response: function(data) {
                if (stream.respond) stream.respond(data);
            }
        });
    }
};

var Stream = sardVar27(sardVar27.copy(proto, {
    __construct: function(ttl) {
        this._init(ttl);
    }
}));

Stream.proto = proto;

sardModule35 = Stream;
var sardModule37 = {}; 
var sardVar26 = sardModule25, sardVar36 = sardModule35;

var PushRouter = sardVar26.extend({
    "override on": function(expr, callback) {
        this._super(expr, callback);
        if (expr.meta.pull) {
            this.controller.pull(expr, null, {
                ignoreWarning: true
            }, callback);
        }
    },
    "override _callListeners": function(ops) {
        var stream = new sardVar36(true), callback = ops.callback || function(stream) {
            return ops.data;
        };
        var ret = callback(stream);
        if (ret != undefined) {
            stream.end(ret);
        }
        ops.stream = stream;
        this._super.apply(this, arguments);
    }
});

sardModule37 = PushRouter;
var sardModule43 = {}; 
var sardVar40 = sardModule17, sardVar41 = sardModule35, sardVar42 = sardModule0;

var PushPullRequest = sardVar40.extend(sardVar42.copy(sardVar41.proto, {
    init: function() {
        this._init();
        return this;
    },
    _listen: function(listener, meta) {
        if (!meta.stream) {
            var buffer = [], self = this;
            this.pipe({
                write: function(data) {
                    buffer.push(data);
                },
                end: function() {
                    if (meta.batch) {
                        listener.apply(self, [ buffer, self ]);
                    } else {
                        if (!buffer.length) {
                            listener();
                        } else for (var i = 0, n = buffer.length; i < n; i++) {
                            listener.apply(self, [ buffer[i], self ]);
                        }
                    }
                }
            });
        } else {
            listener.call(this, this);
        }
    }
}));

sardModule43 = PushPullRequest;
var sardModule45 = {}; 
var sardVar39 = sardModule35, sardVar44 = sardModule43;

var PushRequest = sardVar44.extend({
    "override init": function() {
        this._super();
        this.cache();
        this.stream.pipe(this);
        return this;
    },
    "override _callback": function(route, data) {
        this._listen(route.callback, route.meta);
    }
});

sardModule45 = PushRequest;
var sardModule47 = {}; 
var sardVar38 = sardModule37, sardVar46 = sardModule45;

sardModule47.types = [ "push" ];

sardModule47.test = function(expr) {
    return expr.type == "push" ? "push" : null;
};

sardModule47.newRouter = function() {
    return new sardVar38({
        multi: true,
        RequestClass: sardVar46
    });
};
var sardModule53 = {}; 
var sardVar50 = sardModule17, sardVar51 = sardModule35, sardVar52 = sardModule0;

var PushPullRequest = sardVar50.extend(sardVar52.copy(sardVar51.proto, {
    init: function() {
        this._init();
        return this;
    },
    _listen: function(listener, meta) {
        if (!meta.stream) {
            var buffer = [], self = this;
            this.pipe({
                write: function(data) {
                    buffer.push(data);
                },
                end: function() {
                    if (meta.batch) {
                        listener.apply(self, [ buffer, self ]);
                    } else {
                        if (!buffer.length) {
                            listener();
                        } else for (var i = 0, n = buffer.length; i < n; i++) {
                            listener.apply(self, [ buffer[i], self ]);
                        }
                    }
                }
            });
        } else {
            listener.call(this, this);
        }
    }
}));

sardModule53 = PushPullRequest;
var sardModule56 = {}; 
var sardVar54 = sardModule53, sardVar55 = sardModule0;

var PullRequest = sardVar54.extend({
    "override init": function() {
        this._super();
        this._listen(this.callback, this.meta);
        return this;
    },
    "override _callback": function() {
        var ret = this._super.apply(this, arguments);
        if (ret != undefined) {
            this.end(ret);
        }
    }
});

sardModule56 = PullRequest;
var sardModule58 = {}; 
var sardVar49 = sardModule25, sardVar57 = sardModule56;

sardModule58.types = [ "pull" ];

sardModule58.test = function(expr) {
    return expr.type == "pull" ? expr.meta.multi ? "pullMulti" : "pull" : null;
};

sardModule58.newRouter = function(type) {
    var ops = {
        RequestClass: sardVar57
    };
    if (type == "pullMulti") ops.multi = true;
    return new sardVar49(ops);
};
var sardModule61 = {}; 
var sardVar60 = sardModule25;

sardModule61.types = [ "dispatch" ];

sardModule61.test = function(expr) {
    return !expr.type || expr.type == "dispatch" ? "dispatch" : null;
};

sardModule61.newRouter = function() {
    return new sardVar60({
        multi: true
    });
};
var sardModule63 = {}; 
var sardVar3 = sardModule0;

sardModule63 = function(controller) {
    var mw = new sardModule63.Middleware(controller);
    mw.add(sardModule47);
    mw.add(sardModule58);
    mw.add(sardModule61);
    return mw;
};

sardModule63.Middleware = sardVar3({
    __construct: function(controller) {
        this._middleware = [];
        this._controller = controller;
        this._routers = {};
        this.types = [];
    },
    add: function(module) {
        this._middleware.push(module);
        this.types = module.types.concat(this.types);
        for (var i = module.types.length; i--; ) {
            this._controller._createTypeMethod(module.types[i]);
        }
    },
    router: function(expr) {
        for (var i = this._middleware.length; i--; ) {
            var mw = this._middleware[i], name = mw.test(expr);
            if (name) return this._router(mw, name);
        }
        return null;
    },
    _router: function(tester, name) {
        return this._routers[name] || this._newRouter(tester, name);
    },
    _newRouter: function(tester, name) {
        var router = tester.newRouter(name);
        router.type = name;
        router.controller = this._controller;
        this._routers[name] = router;
        return router;
    }
});
var sardModule68 = {}; 
var sardVar67 = sardModule31;

sardModule68.Janitor = sardVar67({
    __construct: function() {
        this.dispose();
    },
    addDisposable: function() {
        var args = arguments[0] instanceof Array ? arguments[0] : arguments;
        for (var i = args.length; i--; ) {
            var target = args[i];
            if (target && target["dispose"]) {
                if (this.disposables.indexOf(target) == -1) this.disposables.push(target);
            }
        }
    },
    dispose: function() {
        if (this.disposables) for (var i = this.disposables.length; i--; ) {
            this.disposables[i].dispose();
        }
        this.disposables = [];
    }
});
var sardModule71 = {}; 
var sardVar2 = sardModule0, sardVar64 = sardModule63, sardVar65 = sardModule13, sardVar66 = sardModule6, Janitor = sardModule68.Janitor, sardVar70 = sardModule8;

var Controller = sardVar2({
    __construct: function(target) {
        this.metaMiddleware = sardVar65(this);
        this.routeMiddleware = sardVar64(this);
        this._channels = {};
    },
    has: function(type, ops) {
        var expr = this._parseOps(type, ops);
        return this._router(expr).hasRoute(expr);
    },
    getRoute: function(type, ops) {
        var expr = this._parse(type, ops);
        return this._router(expr).getRoute(expr);
    },
    on: function(target) {
        var ja = new Janitor;
        for (var type in target) {
            ja.addDisposable(this.on(type, {}, target[type]));
        }
        return ja;
    },
    "second on": function(type, callback) {
        this.on(type, {}, callback);
    },
    "third on": function(type, ops, callback) {
        var expr = this._parse(type, ops), router = this.routeMiddleware.router(expr), pathStr = sardVar70.pathToString(expr.channel.paths);
        if (!this._channels[pathStr]) {
            this.addChannel(pathStr, expr);
        }
        return router.on(expr, callback);
    },
    channels: function() {
        return this._channels;
    },
    addChannel: function(path, expr) {
        this._channels[path] = expr;
    },
    _parse: function(type, ops) {
        var expr = typeof type != "object" ? sardVar66.parse(type) : type;
        if (ops) {
            if (ops.meta) sardVar2.copy(ops.meta, expr.meta);
            if (ops.type) expr.type = ops.type;
        }
        return expr;
    },
    _createTypeMethod: function(method) {
        var self = this;
        this[method] = function(type, data, ops, callback) {
            if (!ops) ops = {};
            ops.type = method;
            var expr = self._parse(type, ops);
            self.routeMiddleware.router(expr).dispatch(expr, data, ops, callback);
        };
    }
});

sardModule71 = Controller;
var sardModule73 = {}; 
var sardVar1 = sardModule0, sardVar72 = sardModule71;

try {
    require.paths.unshift(__dirname + "/beans");
} catch (e) {}

var Loader = sardVar72.extend({
    "override __construct": function() {
        this._super();
        this._params = {};
    },
    params: function(params) {
        sardVar1.copy(params || {}, this._params);
    },
    require: function(source) {
        if (source instanceof Array) {
            for (var i = source.length; i--; ) {
                this.require(source[i]);
            }
        } else if (typeof src == "object" && typeof src.bean == "function") {
            source.plugin(this._controller, source.params || this._params[source.name] || {});
        } else {
            return false;
        }
        return this;
    }
});

sardModule73 = Loader;
var sardModule75 = {}; 
var sardVar74 = sardModule73;

sardModule75.router = function() {
    return new sardVar74;
};

sardModule75.router().copyTo(sardModule75, true);
var sardModule77 = {}; 
var sardVar76 = sardModule75;

window.beanpole = sardVar76;
