var http = require('http');
var express = require('express')
var WebSocketServer = require('ws').Server;
var program = require('commander');

// has info and state of various parts of Silk.  Used mainly be api.
global.Silk = {
  set: function(prop, value){
    if(prop in Silk.data){
      Silk.data[prop].value = value;
    }
    else{
      Silk.data[prop] = {
        value: value,
        needUpdates: []
      }
    }
  },
  get: function(prop){
    return Silk.data[prop].value;
  },
  data: {}
};
global.__root = __dirname;

var app = express(),
  server,
  wss,
  windows;

program
  .version('0.3.0')
  .option('-r, --remote', 'Remotely access Silk')
  .option('-d, --dev', 'Show debug messages')
  .parse(process.argv);

program.dev ? global.debug = console.log : global.debug = function(){};


app.get('/', function (req, res) {
  res.sendFile(__root + "/window-manager/public/index.html");
});

// static files for client
app.use(express.static(__dirname + '/window-manager/public'));
app.get(/^\/bc\//, require(__root + "/core/bower_static.js"));
app.get("/api.js", require(__root + "/core/client_api.js"));

server = app.listen(3000, function () {
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

wss = new WebSocketServer({
  server: server,
  path: '/websocket'
});

debug("web socket is at: " + wss.options.host + wss.options.path);

wss.on('connection', function (ws) {
  debug("connected");
  ws.on('message', function (message) {

    debug("websocket message: " + message);


    methods.call(ws, message);
  });
});

var windows = require(__root + "/core/fork_framework")(app, wss);

require('./core/remote.js');

if (program.remote) {
  Silk.get('remote/start')();
}