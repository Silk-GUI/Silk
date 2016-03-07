global.__root = __dirname;
var http = require('http');
var express = require('express');
var SockJS = require('sockjs');
var program = require('commander');
var configJson = require('./config.json');
var logger = require('./core/console.js');
var apiData = require('./core/api_data.js');

process.title = "Silk GUI";

var app    = express(),
    server,
    wss,
    windows,
    url,
    toLoad = 2,
    loaded = 0;

program
  .version('0.4.2')
  .option('-r, --remote', 'Remotely access Silk')
  .option('-d, --dev', 'Show debug messages')
  .option('-o, --open', 'Open Silk in a window')
  .parse(process.argv);

if(process.argv[1] === 'help' || process.argv[2] === 'help') {
  // silk help or npm start help was run.
  program.help();
  process.exit(0);
}
logger.logLevel(program.dev ? 0 : 1);

function start() {
  var spinner = new logger.Spinner('Starting Silk');
  spinner.start();

  // hides spinner and shows url when finished loading;
  function loader() {
    loaded += 1;
    if(loaded === toLoad) {
      spinner.stop();
      process.stdout.write('\r ' + url);
      console.log('');
    }
  }

  // static files for client
  app.get(/^\/bc\//, require(__root + "/core/bower_static.js"));
  app.get("/api.js", require(__root + "/core/client_api.js"));

  server = app.listen(3000, function (err) {

    var address = server.address();
    url = 'Silk at http://localhost:' + address.port;
    loader();
  });

  server.on('error', function (err){
    if(err.code === 'EADDRINUSE') {
      console.log('Another process is using port 3000');
    } else {
      console.trace(err);
    }
    process.exit();
  });

  var sockOptions = {
    sockjs_url: '//cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js'
  };

  if(!program.dev) {
    sockOptions.log = function (severity, message) {
      if(severity === 'error') {
        console.log(message);
      }
    };
  }

  wss = SockJS.createServer(sockOptions);
  wss.installHandlers(server, {
    prefix: '/ws'
  });

  var forkFramework = require(__root + "/core/fork_framework");
  forkFramework(app, wss, function () {
    loader();
  });

  forkFramework.startWindowManager(configJson.windowManager, app, function (e, d) {
    if(e) {
      console.log('error starting window manager');
      console.log(e);
    }
  });

  require('./core/remote.js');

  if(program.remote) {
    apiData.get('remote/start')(true);
  }

  if(program.open) {
    require('./core/electron/open.js')(program.devtools);
  }
}
start();
