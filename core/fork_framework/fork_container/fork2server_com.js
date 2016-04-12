/*
 Similar to meteor.methods
 */
var serverAPI = require('./server_api.js');
var User = require('./ws_puppet.js');

var methods = {};

function MethodCall(message) {
  this.id = message.id;
  this.ws = message.ws;
  this.name = message.name;
  this.data = message.data;
}

MethodCall.prototype.exec = function () {
  var self = this;
  var result;
  try {
    result = methods.list[this.name](this.data, this, function (e, result) {
      if (e) return self.sendErr(e);
      if (result) return self.sendResult(result);
      console.log('no error, no result');
    });
  } catch (e) {
    console.log('error in method ' + this.name);
    console.log(e.stack);
    return this.sendErr(e);
  }
  if (typeof result !== 'undefined') {
    this.sendResult(result);
  }
};

MethodCall.prototype.sendErr = function (e) {
  process.send({
    cmd: 'send', message: {
      id: this.id,
      ws: this.ws.id,
      error: e.toString(),
      data: null
    }
  });
};
MethodCall.prototype.sendResult = function (result) {
  process.send({
    cmd: 'send', message: {
      id: this.id,
      ws: this.ws.id,
      error: null,
      data: result
    }
  });
};

// object of all methods
methods.list = {};
methods.users = {};

// function to add method to methods.list
methods.add = function (array) {
  var method;

  for (method in array) {
    if (array.hasOwnProperty(method)) {
      methods.list[method] = array[method];
      process.send({ cmd: 'add', name: method });
    }
  }
};

// execute method when called by client
methods.call = function (ws, message) {
  var meth;
  try {
    meth = new MethodCall(ws, message);
  } catch (e) {
    return console.log('error: ' + e + ', message: ' + JSON.stringify(message));
  }
  meth.exec();
};
process.on('message', function (message) {
  var meth;

  if (!(message.ws in methods.users)) {
    methods.users[message.ws] = new User(message.ws);
  }
  message.ws = methods.users[message.ws];
  /*
   Commands:
   disconnect: Head is closed
   server api: return value for silk api method
   */
  if (!('cmd' in message)) {
    meth = new MethodCall(message);
    return meth.exec();
  }
  switch (message.cmd) {
    case 'disconnect':
      message.ws.emit('close');
      break;
    case 'close':
      break; // expected to close, will close forcfully in 5 seconds
    case 'sleep':
      break; // Head is removed from the window manager so updates are impossible
    case 'minimize':
      break; // Head is not removed but updates to the head will not be seen
    case 'server api':
      serverAPI.done(message);
      break;
    default:
      console.log('unknown message command');
  }
});

// make global because it will be used in most files.
global.Silk = {};
global.Silk.methods = methods;
global.Silk.api = serverAPI;

global.methods = methods;

process.nextTick(function () {
  process.title = process.env.app;
  require(process.env.start);
});

process.send({ cmd: 'ready' });
