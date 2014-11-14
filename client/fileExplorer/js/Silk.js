/*! Silk.js 2014-11-12 */
var Channel = function() {
    "use strict";
    function s_addBoundChan(win, origin, scope, handler) {
        function hasWin(arr) {
            for (var i = 0; i < arr.length; i++) if (arr[i].win === win) return !0;
            return !1;
        }
        var exists = !1;
        if ("*" === origin) {
            for (var k in s_boundChans) if (s_boundChans.hasOwnProperty(k) && "*" !== k && "object" == typeof s_boundChans[k][scope] && (exists = hasWin(s_boundChans[k][scope]))) break;
        } else s_boundChans["*"] && s_boundChans["*"][scope] && (exists = hasWin(s_boundChans["*"][scope])), 
        !exists && s_boundChans[origin] && s_boundChans[origin][scope] && (exists = hasWin(s_boundChans[origin][scope]));
        if (exists) throw "A channel is already bound to the same window which overlaps with origin '" + origin + "' and has scope '" + scope + "'";
        "object" != typeof s_boundChans[origin] && (s_boundChans[origin] = {}), "object" != typeof s_boundChans[origin][scope] && (s_boundChans[origin][scope] = []), 
        s_boundChans[origin][scope].push({
            win: win,
            handler: handler
        });
    }
    function s_removeBoundChan(win, origin, scope) {
        for (var arr = s_boundChans[origin][scope], i = 0; i < arr.length; i++) arr[i].win === win && arr.splice(i, 1);
        0 === s_boundChans[origin][scope].length && delete s_boundChans[origin][scope];
    }
    function s_isArray(obj) {
        return Array.isArray ? Array.isArray(obj) : -1 != obj.constructor.toString().indexOf("Array");
    }
    var s_curTranId = Math.floor(1000001 * Math.random()), s_boundChans = {}, s_transIds = {}, s_onMessage = function(e) {
        try {
            var m = JSON.parse(e.data);
            if ("object" != typeof m || null === m) throw "malformed";
        } catch (e) {
            return;
        }
        var s, i, meth, w = e.source, o = e.origin;
        if ("string" == typeof m.method) {
            var ar = m.method.split("::");
            2 == ar.length ? (s = ar[0], meth = ar[1]) : meth = m.method;
        }
        if ("undefined" != typeof m.id && (i = m.id), "string" == typeof meth) {
            var delivered = !1;
            if (s_boundChans[o] && s_boundChans[o][s]) for (var j = 0; j < s_boundChans[o][s].length; j++) if (s_boundChans[o][s][j].win === w) {
                s_boundChans[o][s][j].handler(o, meth, m), delivered = !0;
                break;
            }
            if (!delivered && s_boundChans["*"] && s_boundChans["*"][s]) for (var j = 0; j < s_boundChans["*"][s].length; j++) if (s_boundChans["*"][s][j].win === w) {
                s_boundChans["*"][s][j].handler(o, meth, m);
                break;
            }
        } else "undefined" != typeof i && s_transIds[i] && s_transIds[i](o, meth, m);
    };
    return window.addEventListener ? window.addEventListener("message", s_onMessage, !1) : window.attachEvent && window.attachEvent("onmessage", s_onMessage), 
    {
        build: function(cfg) {
            var debug = function(m) {
                if (cfg.debugOutput && window.console && window.console.log) {
                    try {
                        "string" != typeof m && (m = JSON.stringify(m));
                    } catch (e) {}
                    console.log("[" + chanId + "] " + m);
                }
            };
            if (!window.postMessage) throw "jschannel cannot run this browser, no postMessage";
            if (!window.JSON || !window.JSON.stringify || !window.JSON.parse) throw "jschannel cannot run this browser, no JSON parsing/serialization";
            if ("object" != typeof cfg) throw "Channel build invoked without a proper object argument";
            if (!cfg.window || !cfg.window.postMessage) throw "Channel.build() called without a valid window argument";
            if (window === cfg.window) throw "target window is same as present window -- not allowed";
            var validOrigin = !1;
            if ("string" == typeof cfg.origin) {
                var oMatch;
                "*" === cfg.origin ? validOrigin = !0 : null !== (oMatch = cfg.origin.match(/^https?:\/\/(?:[-a-zA-Z0-9_\.])+(?::\d+)?/)) && (cfg.origin = oMatch[0].toLowerCase(), 
                validOrigin = !0);
            }
            if (!validOrigin) throw "Channel.build() called with an invalid origin";
            if ("undefined" != typeof cfg.scope) {
                if ("string" != typeof cfg.scope) throw "scope, when specified, must be a string";
                if (cfg.scope.split("::").length > 1) throw "scope may not contain double colons: '::'";
            }
            var chanId = function() {
                for (var text = "", alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", i = 0; 5 > i; i++) text += alpha.charAt(Math.floor(Math.random() * alpha.length));
                return text;
            }(), regTbl = {}, outTbl = {}, inTbl = {}, ready = !1, pendingQueue = [], createTransaction = function(id, origin, callbacks) {
                var shouldDelayReturn = !1, completed = !1;
                return {
                    origin: origin,
                    invoke: function(cbName, v) {
                        if (!inTbl[id]) throw "attempting to invoke a callback of a nonexistent transaction: " + id;
                        for (var valid = !1, i = 0; i < callbacks.length; i++) if (cbName === callbacks[i]) {
                            valid = !0;
                            break;
                        }
                        if (!valid) throw "request supports no such callback '" + cbName + "'";
                        postMessage({
                            id: id,
                            callback: cbName,
                            params: v
                        });
                    },
                    error: function(error, message) {
                        if (completed = !0, !inTbl[id]) throw "error called for nonexistent message: " + id;
                        delete inTbl[id], postMessage({
                            id: id,
                            error: error,
                            message: message
                        });
                    },
                    complete: function(v) {
                        if (completed = !0, !inTbl[id]) throw "complete called for nonexistent message: " + id;
                        delete inTbl[id], postMessage({
                            id: id,
                            result: v
                        });
                    },
                    delayReturn: function(delay) {
                        return "boolean" == typeof delay && (shouldDelayReturn = delay === !0), shouldDelayReturn;
                    },
                    completed: function() {
                        return completed;
                    }
                };
            }, setTransactionTimeout = function(transId, timeout, method) {
                return window.setTimeout(function() {
                    if (outTbl[transId]) {
                        var msg = "timeout (" + timeout + "ms) exceeded on method '" + method + "'";
                        outTbl[transId].error("timeout_error", msg), delete outTbl[transId], delete s_transIds[transId];
                    }
                }, timeout);
            }, onMessage = function(origin, method, m) {
                if ("function" == typeof cfg.gotMessageObserver) try {
                    cfg.gotMessageObserver(origin, m);
                } catch (e) {
                    debug("gotMessageObserver() raised an exception: " + e.toString());
                }
                if (m.id && method) {
                    if (regTbl[method]) {
                        var trans = createTransaction(m.id, origin, m.callbacks ? m.callbacks : []);
                        inTbl[m.id] = {};
                        try {
                            if (m.callbacks && s_isArray(m.callbacks) && m.callbacks.length > 0) for (var i = 0; i < m.callbacks.length; i++) {
                                for (var path = m.callbacks[i], obj = m.params, pathItems = path.split("/"), j = 0; j < pathItems.length - 1; j++) {
                                    var cp = pathItems[j];
                                    "object" != typeof obj[cp] && (obj[cp] = {}), obj = obj[cp];
                                }
                                obj[pathItems[pathItems.length - 1]] = function() {
                                    var cbName = path;
                                    return function(params) {
                                        return trans.invoke(cbName, params);
                                    };
                                }();
                            }
                            var resp = regTbl[method](trans, m.params);
                            trans.delayReturn() || trans.completed() || trans.complete(resp);
                        } catch (e) {
                            var error = "runtime_error", message = null;
                            if ("string" == typeof e ? message = e : "object" == typeof e && (e && s_isArray(e) && 2 == e.length ? (error = e[0], 
                            message = e[1]) : "string" == typeof e.error && (error = e.error, e.message ? "string" == typeof e.message ? message = e.message : e = e.message : message = "")), 
                            null === message) try {
                                message = JSON.stringify(e), "undefined" == typeof message && (message = e.toString());
                            } catch (e2) {
                                message = e.toString();
                            }
                            trans.error(error, message);
                        }
                    }
                } else m.id && m.callback ? outTbl[m.id] && outTbl[m.id].callbacks && outTbl[m.id].callbacks[m.callback] ? outTbl[m.id].callbacks[m.callback](m.params) : debug("ignoring invalid callback, id:" + m.id + " (" + m.callback + ")") : m.id ? outTbl[m.id] ? (m.error ? outTbl[m.id].error(m.error, m.message) : void 0 !== m.result ? outTbl[m.id].success(m.result) : outTbl[m.id].success(), 
                delete outTbl[m.id], delete s_transIds[m.id]) : debug("ignoring invalid response: " + m.id) : method && regTbl[method] && regTbl[method]({
                    origin: origin
                }, m.params);
            };
            s_addBoundChan(cfg.window, cfg.origin, "string" == typeof cfg.scope ? cfg.scope : "", onMessage);
            var scopeMethod = function(m) {
                return "string" == typeof cfg.scope && cfg.scope.length && (m = [ cfg.scope, m ].join("::")), 
                m;
            }, postMessage = function(msg, force) {
                if (!msg) throw "postMessage called with null message";
                var verb = ready ? "post  " : "queue ";
                if (debug(verb + " message: " + JSON.stringify(msg)), force || ready) {
                    if ("function" == typeof cfg.postMessageObserver) try {
                        cfg.postMessageObserver(cfg.origin, msg);
                    } catch (e) {
                        debug("postMessageObserver() raised an exception: " + e.toString());
                    }
                    cfg.window.postMessage(JSON.stringify(msg), cfg.origin);
                } else pendingQueue.push(msg);
            }, onReady = function(trans, type) {
                if (debug("ready msg received"), ready) throw "received ready message while in ready state.  help!";
                for (chanId += "ping" === type ? "-R" : "-L", obj.unbind("__ready"), ready = !0, 
                debug("ready msg accepted."), "ping" === type && obj.notify({
                    method: "__ready",
                    params: "pong"
                }); pendingQueue.length; ) postMessage(pendingQueue.pop());
                "function" == typeof cfg.onReady && cfg.onReady(obj);
            }, obj = {
                unbind: function(method) {
                    if (regTbl[method]) {
                        if (!delete regTbl[method]) throw "can't delete method: " + method;
                        return !0;
                    }
                    return !1;
                },
                bind: function(method, cb) {
                    if (!method || "string" != typeof method) throw "'method' argument to bind must be string";
                    if (!cb || "function" != typeof cb) throw "callback missing from bind params";
                    if (regTbl[method]) throw "method '" + method + "' is already bound!";
                    return regTbl[method] = cb, this;
                },
                call: function(m) {
                    if (!m) throw "missing arguments to call function";
                    if (!m.method || "string" != typeof m.method) throw "'method' argument to call must be string";
                    if (!m.success || "function" != typeof m.success) throw "'success' callback missing from call";
                    var callbacks = {}, callbackNames = [], pruneFunctions = function(path, obj) {
                        if ("object" == typeof obj) for (var k in obj) if (obj.hasOwnProperty(k)) {
                            var np = path + (path.length ? "/" : "") + k;
                            "function" == typeof obj[k] ? (callbacks[np] = obj[k], callbackNames.push(np), delete obj[k]) : "object" == typeof obj[k] && pruneFunctions(np, obj[k]);
                        }
                    };
                    pruneFunctions("", m.params);
                    var msg = {
                        id: s_curTranId,
                        method: scopeMethod(m.method),
                        params: m.params
                    };
                    callbackNames.length && (msg.callbacks = callbackNames), m.timeout && setTransactionTimeout(s_curTranId, m.timeout, scopeMethod(m.method)), 
                    outTbl[s_curTranId] = {
                        callbacks: callbacks,
                        error: m.error,
                        success: m.success
                    }, s_transIds[s_curTranId] = onMessage, s_curTranId++, postMessage(msg);
                },
                notify: function(m) {
                    if (!m) throw "missing arguments to notify function";
                    if (!m.method || "string" != typeof m.method) throw "'method' argument to notify must be string";
                    postMessage({
                        method: scopeMethod(m.method),
                        params: m.params
                    });
                },
                destroy: function() {
                    s_removeBoundChan(cfg.window, cfg.origin, "string" == typeof cfg.scope ? cfg.scope : ""), 
                    window.removeEventListener ? window.removeEventListener("message", onMessage, !1) : window.detachEvent && window.detachEvent("onmessage", onMessage), 
                    ready = !1, regTbl = {}, inTbl = {}, outTbl = {}, cfg.origin = null, pendingQueue = [], 
                    debug("channel destroyed"), chanId = "";
                }
            };
            return obj.bind("__ready", onReady), setTimeout(function() {
                postMessage({
                    method: scopeMethod("__ready"),
                    params: "ping"
                }, !0);
            }, 0), obj;
        }
    };
}(), Silk = {}, chan = Channel.build({
    window: window.parent,
    origin: "*",
    scope: "testScope"
});

chan.bind("reverse", function(trans, s) {
    return console.log("received message"), s.split("").reverse().join("");
}), Silk.openFile = function(path, mime) {
    chan.notify({
        method: "openFile",
        params: {
            path: path,
            mime: mime
        }
    });
}, Silk.fileToOpen = function() {
    name = "file", name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)", regex = new RegExp(regexS), results = regex.exec(window.location.href);
    return null == results ? null : decodeURIComponent(results[1]);
};