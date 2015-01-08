/*
  User initializes local machine
  1) User chooses a password
  2) Allow user to choose where to tunnel to
  3) Make tunnel request
  4) On accept, the tunnel is now ready

  User connects to foreign server
  1) User makes a request to a server with given password
  2) Server checks password with local
  3) Local accepts or denies

  If accept
  1) Server identifies users machine is that machine
  2) User makes an http request to the server
  3) server send to local
  4) local makes a request on specified port


  http port
  websocketport


*/
var net = require("net");
var url = require("url");
var http = require("http");
var ws = require("ws");

function Tunnel2Proxy(httpport, websocketport){
  this.httpport = httpport || 3000;
  this.websocketport = websocketport || 9999;
  this.proxyServer;
  this.pass;
  this.name;
  this.ready = false;
  this.inprogress = {};
  this.verified = [];
}

Tunnel2Proxy.prototype.setPass = function(pass){
  this.pass = pass;
}

Tunnel2Proxy.prototype.setServer = function(uri, pass,cb){
  if(!pass){
    if(!this.pass) throw new Error("cannot connect to server without password");
  }else
    this.pass = pass
  uri = url.parse(uri);
  var that = this;
  this.proxyServer = net.connect({port:uri.port, host:uri.hostname}, function(){
    that.ready = true;
    that.proxyServer.write("new");
  })
  this.proxyServer.uri = uri;
  this.proxyServer.on("error",function(e){
    console.log(e);
    cb(e);
  })
  this.proxyServer.on("close",function(){
    that.verified = [];
  })
  var t2pbuffer = "";
  socketWrapper(this.proxyServer,function(data){
    try{
      data = JSON.parse(data);
    }catch(e){
      that.proxyServer.destroy();
      console.log(e);
      console.log(data);
      return;
    }
    if(data.name === "id"){
      cb(void(0),data.data);
      console.log("your servers name is: "+data.data)
    }else{
      that.handleSocketMessage(data);
    }
  })
  this.proxyWS = ws.connect("ws://localhost:9999",function(){
    console.log("connected as websocket: "+arguments)
  });
  this.proxyWS.on("error",function(e){
    console.log(e.stack);
  })
  this.proxyWS.on("message",function(data){
    that.proxyServer.write(data+"\u00B6");
  })
}

Tunnel2Proxy.prototype.handleSocketMessage = function(data){
  if(data.name == "auth"){
    if(this.pass == data.data.pass){
      this.verified.push(data.client);
      data.error = null;
      data.data = "ok";
    }else{
      data.error = new Error("Not ok");
      data.data = null;
    };
    this.serverSend(data);
    return;
  }
  if(this.verified.indexOf(data.client) == -1){
    console.log(data);
    console.log("this client is not verified");
    return;
  }
  if(data.name == "socketrequest"){
    return this.httpSocket(data);
  }
  this.message(data);
}

Tunnel2Proxy.prototype.httpSocket = function(data){
  var that = this;
  var uri = that.proxyServer.uri
  var httpsocket = net.connect(
    {port:uri.port, host:uri.hostname,allowHalfOpen: true},
    function(){
      httpsocket.write("http:"+data.client);
      console.log("http socket ready")
      delete data;
    }
  );
  var req;
  var header = "";
  var res;
  httpsocket.on("data",function(data){
    temp = data.toString("utf-8");
    var i = temp.indexOf('\u00B6');
    if(i == -1){
      header += temp;
      return;
    }
    httpsocket.removeAllListeners("data");
    header += temp.substring(0,i);
    temp = new Buffer(temp.substring(0,i+1));
    data = data.slice(temp.length);
    header = JSON.parse(header);
    header.port = that.httpport;
    req = http.request(header,function(res) {
      var data = {
        headers : res.headers,
        statusCode : res.statusCode
      };
      httpsocket.write(JSON.stringify(data)+"\u00B6");
      res.pipe(httpsocket);
    });
    req.write(data);
    httpsocket.pipe(req)
  })
}


Tunnel2Proxy.prototype.message = function(data){
  if(data.protocol == "http"){
  }else if(data.protocol == "ws"){
    console.log("ws");
    this.proxyWS.send(JSON.stringify(data));
  }else
    console.log("unsupported protocol");
}



function socketWrapper(socket,cb){
  socket.___buffer = "";
  socket.on('data', function(data) {
    socket.___buffer += data.toString("utf-8");
    var d_index = socket.___buffer.indexOf('\u00B6'); // Find the delimiter
    while (d_index > -1) {
      data = socket.___buffer.substring(0,d_index); // Create string up until the delimiter
      cb(data);
      socket.___buffer = socket.___buffer.substring(d_index+1);
      d_index = socket.___buffer.indexOf('\u00B6');
    }
  });
  socket.on("end", function(){
    cb(socket.___buffer);
  })
}

Tunnel2Proxy.prototype.serverSend = function(m){
  this.proxyServer.write(JSON.stringify(m)+"\u00B6");
}

module.exports = Tunnel2Proxy;
