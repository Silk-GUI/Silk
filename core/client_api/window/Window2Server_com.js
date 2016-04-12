/* eslint-disable block-scoped-var */

if (typeof module !== 'undefined' && module.exports) {
  var MessageWriter = require('../abstract/MessageWriter.js'); // eslint-disable-line vars-on-top
}

/**
 Provides a websocket connection to a host. Is the client implementation of
 {@linkcode https://github.com/einaros/ws}

 @memberof ClientSide
 @constructor
 @augments MessageWriter
 @param {string} host - the domain that we will be speaking to
 @param {string} [port=80] - the port to connect to
 @param {string} [path=""] - the path that will be appended to all namespaces
 */
function Server(host, port, path) {
  var self = this;
  path = path || false;
  port = port || 80;
  MessageWriter.call(this, function (message) {
    if (path) {
      message.name = path + message.name;
    }
    self.socket.send(JSON.stringify(message));
  });
  // method calls that are sent and waiting an answer
  try {
    this.host = 'ws://' + host + ':' + port + '/ws/websocket';
    this.socket = new WebSocket(this.host);
    this.socket.onopen = function () {
      self.ready();
    };
    this.socket.onmessage = function (message) {
      console.log(message);
      try {
        message = JSON.parse(message.data);
      } catch (e) {
        self.socket.close();
      }
      self.returnMessage(message);
    };
    this.socket.onclose = function () {
      console.log('Socket Status: ' + self.socket.readyState + ' (Closed)');
      self.stop();
    };
  } catch (exception) {
    console.log('Error' + exception);
  }
}

Server.prototype = Object.create(MessageWriter.prototype);
Server.prototype.constructor = Server;

/**
 Provides the server that the current application was originally created by
 @var {Server} DocumentHost
 @memberof ClientSide
 */
/**
 Provides a direct communication to the forked process that the serverside runs on
 @var {Server} ApplicationFork
 @memberof ClientSide
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Server;
} else {
  window.DocumentHost = null;
  (function (url) {
    var port;

    url = /^(http[s]?):\/\/([0-9\.]+|[a-z\-.]+)([?::][0-9]+)?([\/][A-Za-z0-9_\-]+)?(\?.*)?/.exec(url); // eslint-disable-line max-len
    // this in the following line should be global
    port = this.wp || (document.cookie.pwp) ?
      document.cookie.pwp : parseInt(url[3].substring(1), 10);
    console.log(port);
    window.DocumentHost = new Server(url[2], port);
    if (url[4]) {
      // TODO: find a way to get app name without using url
      window.ApplicationFork = new Server(url[2], port, '');
    }
  }(document.URL));
}
