/* global EventEmitter */
var EventEmitter = EventEmitter; // eslint-disable-line no-use-before-define
var doAsync;

if (typeof module !== 'undefined' && module.exports) {
  EventEmitter = require('events').EventEmitter;
  doAsync = process.nextTick.bind(process);
} else {
  doAsync = function (fn) {
    setTimeout(fn, 1);
  };
}

/**
 An io listener that sends messages to the functions wanting to handle them.
 @constructor
 @interface
 @augments EventEmitter
 @param {function} rSendFn - Function that will be called when the router wants to send to the originator {@link MessageRouter#rSendFn}.
 */

function MessageRouter(rSendFn) {
  EventEmitter.call(this);
  if (!this.getListeners) {
    this.getListeners = this.listeners.bind(this);
  }
  if (!rSendFn) {
    throw new Error('Need a manner to send back');
  }
  this._returns = new EventEmitter();
  this.on = this.addListener.bind(this);
  this.off = this.removeListener.bind(this);
  this.rSendFn = rSendFn;
}
MessageRouter.prototype = Object.create(EventEmitter.prototype);
MessageRouter.prototype.constructor = MessageRouter;

/**
 The method that is called when the MessageRouter responds.
 @abstract
 @memberof MessageRouter
 @param {object} message - The response message
 @param {object} user - that transport method that was given to us by {@link MessageRouter#RouteMessage}.
 @return {undefined}
 */
MessageRouter.prototype.rSendFn = function (message, user) { // eslint-disable-line no-unused-vars
  throw new Error('this message is abstract and needs to be overwritten');
};

/**
 The method that is called when the MessageRouter responds.
 @memberof MessageRouter
 @param {object|string} keymethod - An object containing a key to listen for and an associated method
 @param {object} [method] - If there are two arguments then this adds a listener with the first argument as key and second as function
 @return this
 */
MessageRouter.prototype.add = function (keymethod) {
  var self = this;
  var ob = {};

  if (!keymethod) {
    throw new Error('need either a Object(key:function), a key and function or a key');
  }

  if (arguments.length === 2) {
    ob[arguments[0]] = arguments[1];
  } else {
    ob = keymethod;
  }

  Object.keys(ob).forEach(function (key) {
    self.addListener(key, function (message) {
      self.processMessage(message, ob[key]);
    });
    self.emit('add', key, ob[key]);
  });
  return this;
};

/**
 The method to call after you have processed the message the io has recieved.
 @memberof MessageRouter
 @param {object} message - An object containing important message information
 @param {object} user - the user you want to recieve in the {@link MessageRouter#rSendFn}
 */
MessageRouter.prototype.routeMessage = function (message, user, retFn) {
  var self = this;
  var fn;
  retFn = retFn || this.rSendFn;

  if (this.getListeners(message.name).length === 0) {
    message.data = null;
    message.error = 'method ' + message.name + ' does not exist';
    return retFn(message, user);
  }

  message.user = user;

  if (this.getListeners(message.id).length === 0) {
    switch (message.type) {
      case 'get':
        this._returns.once(message.id, function (message) {
          retFn(message, user);
        });
        break;
      case 'pipe':
        fn = function (message) {
          retFn(message, user);
        };
        this._returns.on(message.id, fn);
        try {
          // throws when message router used for window.postMessage
          message.user.on('close', this.removeListener.bind(this, message.id, fn));
        } catch (e) {
          console.log(e);
        }
        break;
      case 'abort':
        this._returns.removeAllListeners(message.id);
        break;
      case 'trigger':
        break;
      default:
        message.data = null;
        message.error = 'Bad message type ' + message.type;
        return retFn(message, user);
    }
  }
  doAsync(function () {
    self.emit(message.name, message);
  });
};

/**
 wrapper message that allows the function to return data and/or send it in a callback
 @memberof MessageRouter
 @param {object} message - request message
 @param {function} fn - the function that will be called
 */
MessageRouter.prototype.processMessage = function (message, fn) {
  var self = this;
  var result;
  var next = function (err, result) {
    message.error = (err) ? err.stack : null;
    message.data = (err) ? null : result;
    self._returns.emit(message.id, message);
  };
  try {
    result = fn(message.data, message, next);
  } catch (e) {
    return next(e);
  }
  if (typeof result !== 'undefined') {
    next(void(0), result);
  }
};

if (typeof module !== 'undefined') {
  module.exports = MessageRouter;
}
