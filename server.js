global.__root = __dirname;

// debug mode
if (global.debug == undefined) {
  global.debug = function (message) {
    console.log(message);
  }
}

var path = require('path');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
  port: 9999
});


debug("web socket is at: " + wss.options.host + ":" + wss.options.port);

wss.on('connection', function (ws) {
  ws.on('message', function (message) {

    debug("websocket message: " + message);


    methods.call(ws, message);
  });
});

var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
})

// static files for client
app.use(express.static(__dirname + '/core/public'));
app.get("/bc/:component", require(__root + "/core/bower_static.js"));

var windows = require(__root + "/core/fork_framework")(app, wss);

var server = app.listen(3000, function () {

  var add = server.address();
  var message = 'Silk at http://' + add.address + ":" + add.port;
  var length = message.length;
  var prespace = "   ";
  // form box
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

  // console.log('Silk at http://%s:%s', add.address, add.port)

});