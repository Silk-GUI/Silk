/* global EventEmitter RSVP StreamPromise */

if (typeof module !== 'undefined') {
  var RSVP = require('rsvp'); // eslint-disable-line vars-on-top
  var StreamPromise = require('./StreamPromise.js'); // eslint-disable-line vars-on-top
  var EventEmitter = require('events').EventEmitter; // eslint-disable-line vars-on-top
}

/**
 An io listener that sends messages to the functions wanting to handle them.
 @interface
 @augments EventEmitter
 @param {function} wSendFn - Function that will be called when you wish to write something to a target.
 */
function MessageWriter(wSendFn) {
  EventEmitter.call(this);
  this.on = this.addListener.bind(this);
  this.off = this.removeListener.bind(this);
  if (typeof this.getListeners === 'undefined') {
    this.getListeners = this.listeners.bind(this);
  }
  this.wSendFn = wSendFn;
  this.queue = [];
  this._ready = false;
  // method calls that are sent and waiting an answer
}

MessageWriter.prototype = Object.create(EventEmitter.prototype);
MessageWriter.prototype.constructor = MessageWriter;

/**
 The method that is called when the MessageWriter writes.
 @abstract
 @memberof MessageWriter
 @param {object} message - The response message
 @param {object} user - that transport method that was given to us by {@link MessageRouter#RouteMessage}.
 @return {undefined}
 */
MessageWriter.prototype.wSendFn = function (message, user) { // eslint-disable-line no-unused-vars
  throw new Error('this message is abstract and needs to be overwritten');
};

/**
 Allows the MessageWriter to know when it can start sending messages
 @function
 @memberof MessageWriter
 */
MessageWriter.prototype.ready = function () {
  this._ready = true;
  while (this.queue.length > 0) {
    this.wSendFn(this.queue.shift());
  }
  return this;
};

/**
 Allows the MessageWriter to know when they it can no longer send messages
 @function
 @memberof MessageWriter
 */
MessageWriter.prototype.stop = function () {
  this._ready = false;
};

/**
 The message to call after you have transformed the data into a readable form
 @function
 @memberof MessageWriter
 @param {object} message - An object containing important message information
 */
MessageWriter.prototype.returnMessage = function (message) {
  if (this.getListeners(message.id).length === 0) {
    throw new Error('non Existant Message');
  }
  this.emit(message.id, message.error, message.data);
};

/**
 Sends a message to the io without expecting a return
 @function
 @memberof MessageWriter
 @param {string} name - the namespace you want to process your data
 @param {object} data - the data you want to send them
 */
MessageWriter.prototype.trigger = function (name, data) {
  this.messageFactory('trigger', name).send(data);
};

/**
 `requestCallback` is what will be called once an io is completed.

 @callback requestCallback
 @param {error} error - an error if one exists
 @param {object} response message - the response that the target gave back
 */

/**
 Sends a message to the io expecting one return value
 @function
 @memberof MessageWriter
 @param {string} key - the namespace you want to process your data
 @param {object} data - the data you want to send them
 @param {requestCallback} [cb] - If no callback is defined, it will return a promise
 @returns {this|Promise} Returns a promise if no callback is defined
 */
MessageWriter.prototype.get = function (name, data, cb) {
  // save callback so we can call it when receiving the reply
  var ret;

  if (typeof cb === 'undefined') {
    ret = RSVP.defer();
    ret.promise.done = ret.promise.then.bind(ret.promise);
    cb = function (err, message) {
      if (err) {
        return ret.reject(err);
      }
      ret.resolve(message);
    };
  }
  this.messageFactory('get', name, cb).send(data);
  return (ret) ? ret.promise : this;
};

/**
 Sends one or more messages to the io expecting one or more return values
 @function
 @memberof MessageWriter
 @param {string} key - the namespace you want to process your data
 @param {...object} [data] - as many data arguments you want to send right away
 @param {requestCallback} [cb] - If no callback or data is defined, it will return a {@link StreamPromise}
 @returns {this|StreamPromise} Returns a {@link StreamPromise} if no callback is defined
 */
MessageWriter.prototype.pipe = function (name, callback) {
  var ret;
  var args = [];
  var p;

  if (arguments.length > 2) {
    args = Array.prototype.slice.call(arguments, 0);
    callback = args.pop();
    name = args.shift();
  } else if (arguments.length === 1) {
    ret = new StreamPromise();
    callback = ret._write.bind(ret);
  }
  p = this.messageFactory('pipe', name, callback);
  while (args.length > 0) {
    p.send(args.shift());
  }

  if (ret) {
    ret.inherit(p.send.bind(p));
    return ret;
  }
  return p;
};

/**
 Aborts a pipe or get request
 @function
 @memberof MessageWriter
 @param {StreamPromise|string} key - the namespace or promise you want to stop
 @returns {this} To allow chaining
 */
MessageWriter.prototype.abort = function (ob) {
  var id;
  if (!ob) {
    throw Error('cannot unpipe ' + ob);
  }
  id = (ob.id) ? ob.id : ob;
  if (this.listeners(id).length === 0) {
    throw new Error('Cannot abort what doesn\'t exist');
  }
  this.removeAllListeners(id);
  return this;
};

MessageWriter.prototype.messageFactory = function (type, name, callback) {
  // id to find callback when returned data is received
  var id = Date.now() + '-' + Math.random();
  var content = {
    id: id,
    name: name,
    type: type
  };
  content.send = function (data) {
    var clone = JSON.parse(JSON.stringify(content));
    clone.data = data;
    if (this._ready) {
      this.wSendFn(clone);
    } else {
      // if there is an error queue it for later when socket connects
      this.queue.push(clone);
    }
  }.bind(this);
  if (type === 'trigger') {
    return content;
  }
  if (type === 'get') {
    this.once(id, callback);
  }
  if (type === 'pipe') {
    this.addListener(id, callback);
  }
  return content;
};

if (typeof module !== 'undefined') {
  module.exports = MessageWriter;
}
