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
  windows,
  url,
  toLoad = 2,
  loaded = 0,
  spinStep = 0;

program
  .version('0.3.0')
  .option('-r, --remote', 'Remotely access Silk')
  .option('-d, --dev', 'Show debug messages')
  .parse(process.argv);

program.dev ? global.debug = console.log : global.debug = function(){};

//loading spinner
function Spinner(){
  this.step = 0;
  this.pattern = '|/-\\';
  var interval;
  this.start = function(){
    var that = this;
    interval = setInterval(function(){
      process.stdout.write('\r ' + that.pattern[that.step] + ' Starting Silk');
      that.step += 1;
      if(that.step === 4){
        that.step = 0;
      }
    }, 175);
  }
  this.stop = function(){
    clearInterval(interval);
  }
}

var spinner = new Spinner();
spinner.start();

// hides spinner and shows url when finished loading;
function loader(){
  loaded += 1;
  if(loaded === toLoad){
    spinner.stop();
   process.stdout.write('\r ' + url);
    console.log('');
  }
}

app.get('/', function (req, res) {
  res.sendFile(__root + "/window-manager/public/index.html");
});

// static files for client
app.use(express.static(__dirname + '/window-manager/public'));
app.get(/^\/bc\//, require(__root + "/core/bower_static.js"));
app.get("/api.js", require(__root + "/core/client_api.js"));

server = app.listen(3000, function () {
  var add = server.address();
  url = 'Silk at http://' + add.address + ':' + add.port;
  loader();
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

require(__root + "/core/fork_framework")(app, wss, function(){
  loader();
});

require('./core/remote.js');

if (program.remote) {
  Silk.get('remote/start')();
}