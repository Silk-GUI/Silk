/* global MessageRouter MessageWriter */

/**
 An io listener that can also write messages.
 @constructor
 @interface
 @augments MessageRouter
 @augments MessageWriter
 @param {function} writwFn - Function that will be called when a MessageDuplex is
 ready to write a message
 @param {function} [readFn=writeFn] - Function that will be called when a MessageDuplex is
 reading a message
 */

function MessageDuplex(wSendFn, rSendFn) {
  var self = this;
  var _writeFn;

  console.log('mesdup');
  if (!rSendFn) rSendFn = wSendFn;
  if (typeof wSendFn === 'undefined') {
    throw new Error('Need at least 1 function');
  }
  _writeFn = wSendFn;
  this.originator = Date.now() + '|' + Math.random();
  wSendFn = function (message) {
    if (message.originator) {
      if (!Array.isArray(message.originator)) {
        throw new Error('something went wrong in the originator chain');
      }
      message.originator.push(self.originator);
    } else {
      message.originator = [self.originator];
    }
    _writeFn(message);
  };
  console.log('b4rout');
  MessageRouter.call(this, rSendFn);
  console.log('b4writ');
  MessageWriter.call(this, wSendFn);
}
MessageDuplex.prototype = Object.create(MessageWriter.prototype);
MessageDuplex.prototype.rSendFn = MessageRouter.prototype.rSendFn;
MessageDuplex.prototype.add = MessageRouter.prototype.add;
MessageDuplex.prototype.routeMessage = MessageRouter.prototype.routeMessage;
MessageDuplex.prototype.processMessage = MessageRouter.prototype.processMessage;

/**
 The method to call after you have processed the message the io has recieved.
 @memberof MessageDuplex
 @param {object} message - An object containing important message information
 @param {object} user - the user you want to recieve in the {@link MessageRouter#rSendFn}
 */
MessageDuplex.prototype.handleMessage = function (message, user) {
  if (message.originator && message.originator.indexOf(this.originator) !== -1) {
    console.log('return');
    this.returnMessage(message);
  } else {
    console.log('route');
    this.routeMessage(message, user);
  }
};
MessageDuplex.prototype.constructor = MessageDuplex;
