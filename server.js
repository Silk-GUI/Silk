var path = require('path');
var http = require('http');
var express = require('express')
var WebSocketServer = require('ws').Server;

global.__root = __dirname;

// debug mode
if (global.debug === undefined) {
  global.debug = function (message) {
    console.log(message);
  }
}

var app = express()

app.get('/', function (req, res) {
  res.sendFile(__root + "/window-manager/public/index.html");
});

// static files for client
app.use(express.static(__dirname + '/window-manager/public'));
app.get(/^\/bc\//, require(__root + "/core/bower_static.js"));
app.get("/api.js", require(__root + "/core/client_api.js"));

var server = app.listen(3000, function () {
  var add = server.address();
  
  // display url in box
  var message = 'Silk at http://' + add.address + ":" + add.port;
  var length = message.length;
  var prespace = "   ";
  var box = "";
  
  for (var i = 0; i < length + 10; ++i) {
    box += "=";
  }
  
  var space = "    ";
  var empty = "";
  
  for (var i = 0; i < length + 10 - 2; ++i) {
    empty += " ";
  }
  
  console.log(prespace + box);
  console.log(prespace + "|" + empty + "|");
  console.log(prespace + "|" + space + message + space + "|");
  console.log(prespace + "|" + empty + "|");
  console.log(prespace + box);
  console.log("");
})

var wss = new WebSocketServer({
  server: server,
  path: '/websocket'
});

debug("web socket is at: " + wss.options.host + wss.options.path);

wss.on('connection', function (ws) {
  console.log("connected");
  ws.on('message', function (message) {

    debug("websocket message: " + message);


    methods.call(ws, message);
  });
});

var windows = require(__root + "/core/fork_framework")(app, wss);