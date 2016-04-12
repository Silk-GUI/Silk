/**
 @constructor
 @param {function} sendFn - Function that will be called when you wish to write something
 to a target.
 */
function StreamPromise(sendFn) {
  if (sendFn) this.sendFn = sendFn;
  this._fails = [];
  this._dones = [];
}

/**
 Provides a send Function if one wasn't provided initially
 @function
 @memberof StreamPromise
 @param {function} sendFn - Function that will be called when you wish to write something
 to a target.
 @returns {this} To allow chaining
 */
StreamPromise.prototype.inherit = function (sendFn) {
  this.sendFn = sendFn;
  return this;
};

StreamPromise.prototype._write = function (err, data) {
  var i;
  if (err) {
    if (this._fails.length === 0) throw err;
    for (i = 0; i < this._fails.length; i++) {
      this._fails[i](err);
    }
    return;
  }
  for (i = 0; i < this._dones.length; i++) {
    this._dones[i](data);
  }
};

/**
 Allows you to add one or more functions to listen to errors. Will throw the error
 if no one is listening
 @function
 @memberof StreamPromise
 @param {function} catchFn - Function that will be called when you wish to listen for errors.
 @returns {this} To allow chaining
 */
StreamPromise.prototype.fail = function (fn) {
  this._fails.push(fn);
  return this;
};
/**
 Allows you to add one or more functions to listen for data
 @function
 @memberof StreamPromise
 @param {function} callbackFn - Function that will be called when the promise resolves
 @returns {this} To allow chaining
 */
StreamPromise.prototype.done = function (fn) {
  this._dones.push(fn);
  return this;
};

/**
 Allows you to send data through it
 @function
 @memberof StreamPromise
 @param {*} data - something that can be stringified
 @returns {this} To allow chaining
 */
StreamPromise.prototype.send = function (data) {
  if (!this.sendFn) throw Error('cannot send without a send Function');
  this.sendFn(data);
  return this;
};
