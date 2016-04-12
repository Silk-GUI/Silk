/*
 Communication between - method calls from the client and app forks.
 - Silk api calls from forks and silk methods.
 */
var serverAPI = require('./server_api.js');
var log = require('../console.js').log;

var methods = {
  wflag: false,
  windows: [],
  requests: {},
  user_reqs: {},
  users: {},
  responders: {},
  fork_resp: {},
  forks: {}
};

methods.add = function (m, fork) {
  log.debug('adding method ' + m.name);
  this.responders[m.name] = fork;
  this.fork_resp[fork.pid].push(m.name);
};

methods.send = function (message) {
  if (!this.requests[message.id]) {
    log.debug('user removed or no request');
    return;
  }
  this.requests[message.id].write(JSON.stringify(message));
};

methods.removeFork = function (fork, code, signal) {
  var i;
  console.log(code + ' ' + signal);

  // delete methods from this fork
  for (i in this.responders) {
    if (this.responders[i].pid === fork.pid) {
      console.log(i);
      delete this.responders[i];
    }
  }
  delete this.fork_resp[fork.pid];
  delete this.forks[fork.pid];
};

methods.addFork = function (fork) {
  this.fork_resp[fork.pid] = [];
  this.forks[fork.pid] = fork;
  fork.on('message', function (message) {
    switch (message.cmd) {
      case 'send':
        methods.send(message.message);
        break;
      case 'add':
        methods.add(message, fork);
        break;
      case 'server api':
        serverAPI.call(message, fork);
        break;
      case 'electron':
        serverAPI.electronMessage(message, fork);
        break;
      default:
        console.log('unknown message command');
    }
  });

  fork.on('error', function (e) {
    console.log(e);
  });
  fork.on('close', function (code, signal) {
    methods.removeFork(fork, code, signal);
  });
};

methods.call = function (ws, message) {
  try {
    message = JSON.parse(message);
  } catch (e) {
    console.log('ERROR');
    console.log('err:' + e);
    console.log('mess: ' + message);
    console.log('typeof: ' + typeof message);
  }
  if (!(message.name in this.responders)) {
    console.log('method not found', message);
    // console.log(JSON.stringify(message));
    return ws.write(JSON.stringify({
      id: message.id,
      ws: ws.id,
      error: 'method ' + message.name + ' does not exist'
    }));
  }
  log.debug('ws id is :' + ws.id);
  if (!this.users[ws.id]) {
    this.users[ws.id] = ws;
    ws.on('close', function () {
      var i;
      var fork;

      delete this.users[ws.id];
      for (i in this.user_reqs[ws.id]) {
        if (this.user_reqs[ws.id].hasOwnProperty(i)) {
          delete this.requests[this.user_reqs[ws.id][i]];
        }
      }
      delete this.user_reqs[ws.id];
      for (fork in this.forks) {
        if (fork.connected) {
          this.forks[fork].send({
            cmd: 'disconnect',
            ws: ws.id
          });
        }
      }
    }.bind(this));
    this.user_reqs[ws.id] = [];
  }
  message.ws = ws.id;
  this.user_reqs[ws.id].push(message.id);
  this.responders[message.name].send(message);
  this.requests[message.id] = ws;
};

module.exports = methods;
