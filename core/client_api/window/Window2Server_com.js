if(typeof module != "undefined" && module.exports){
  var MessageWriter = require(__root+"/core/abstract/MessageWriter.js");
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
function Server(host,port,path){
  var that = this;
  path = (path)?path:false;
  port = (port)?port:80;
  MessageWriter.call(this, function(message){
    if(path)
      message.name = path + message.name;
    that.socket.send(JSON.stringify(message));
  });
  // method calls that are sent and waiting an answer
  try {
    this.host = "ws://"+host+":"+port;
    this.socket = new WebSocket(this.host);
    this.socket.onopen = function(){
      that.ready();
    }
    this.socket.onmessage = function(message){
      console.log(message);
      try{
        message = JSON.parse(message.data);
      }catch(e){
        that.socket.close();
      }
      that.returnMessage(message);
    }
    this.socket.onclose = function(){
      console.log('Socket Status: ' + that.socket.readyState + ' (Closed)');
      that.stop();
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
if(typeof module != "undefined" && module.exports){
  module.exports = Server;
}else{
  window.DocumentHost = null;
  (function(url){
    url = /^(http[s]?):\/\/([0-9\.]+|[a-z\-.]+)([?::][0-9]+)?([\/][A-Za-z0-9_\-]+)?(\?.*)?/.exec(url);
    var port = (typeof wp != "undefined")?wp:(document.cookie.pwp)?document.cookie.pwp:3000+(parseInt(url[3].substring(1))-3000);
    console.log(port);
    window.DocumentHost = new Server(url[2],port);
    if(url[4])
      window.ApplicationFork = new Server(url[2],port,url[4].substring(1)+"-");
  })(document.URL)
}
