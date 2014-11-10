var path = require('path');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
  port: 9999
});
require('./methods.js');
require('./fileExplorer.js');

methods.add({
  "silk/apps/list": function (data) {
    console.log("test");
    console.log("received: " + data);
    return "this is a vlue returned by the method"
  }
});

console.log("web socket is at: " + wss.options.host + ":" + wss.options.port);

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log("websocket message: " + message);
    methods.call(ws,message);
  });
});

var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
})

var server = app.listen(3000, function () {
  var add = server.address()
  console.log('Silk at http://%s:%s', add.address, add.port)
});

// static files for client
app.use(express.static(__dirname + '/client'));

// make app availalbe outisde nodeos
var localtunnel = require('localtunnel');

localtunnel(3000, function(err, tunnel) {
  if (err) {
    console.log(err);
  }
  // the assigned public url for your tunnel
  // i.e. https://abcdefgjhij.localtunnel.me
  console.log("Go to " + tunnel.url + " to remotely access Silk");
});
