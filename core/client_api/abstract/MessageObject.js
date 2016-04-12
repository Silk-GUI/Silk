function MessageObject(message, fn, next) {
  this.id = message.id;
  this.user = message.user;
  this.name = message.name;
  this.data = message.data;
  this.next = function (err, result) {
    var message = {
      id: this.id,
      user: this.user.id,
      error: (err) ? err.stack : null,
      data: (err) ? null : result
    };
    next(message);
  }.bind(this);
  this.exec(fn);
}

MessageObject.prototype.exec = function (fn) {
  var result;
  try {
    result = fn(this.data, this, this.next);
  } catch (e) {
    return this.next(e);
  }
  if (typeof result !== 'undefined') {
    this.next(void(0), result);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageObject;
}
