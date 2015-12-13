global.__root = __dirname;
var http = require('http');
var express = require('express');
var SockJS = require('sockjs');
var program = require('commander');
var configJson = require('./config.json');
var logger = require('./core/console.js');

process.title = "Silk GUI";

// has info and state of various parts of Silk.  Used mainly be api.
var WatchData = require('./core/watch_data.js');
global.Silk = new WatchData();

var app = express(),
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
  .option('--devtools', 'Open nw.js dev tools')
  .parse(process.argv);
if(process.argv[2] === 'help') {
  return program.help();
}

logger.logLevel = program.dev ? 0 : 1;

if(program.dev === true){
  global.debug = console.log;
} else {
  global.debug = function () {};
}




function start () {
    var spinner = new logger.Spinner('Starting Silk');
    spinner.start();
    // hides spinner and shows url when finished loading;
    function loader() {
      loaded += 1;
      if (loaded === toLoad) {
        spinner.stop();
        process.stdout.write('\r ' + url);
        console.log('');
      }
    }
    // app.get('/', function (req, res) {
    //     res.sendFile(__root + "/window-manager/public/index.html");
    // });

// static files for client
    //app.use(express.static(__dirname + '/window-manager/public'));
    app.get(/^\/bc\//, require(__root + "/core/bower_static.js"));
    app.get("/api.js", require(__root + "/core/client_api.js"));

    server = app.listen(3000, function () {
        var address = server.address();
        // IPv6 addresses start with ::ffff:.  Is there any
        // problems with removing it?
        url = 'Silk at http://localhost:' + address.port;
        loader();
    });

    var sockOptions = {
        sockjs_url: '//cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js'
    };

    if (!program.dev) {
        sockOptions.log = function (severity, message) {
            if (severity === 'error') {
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

    forkFramework.startWindowManager(configJson.windowManager, app, function(e, d){
       console.log('started app', e, d);
    });

    require('./core/remote.js');

    if (program.remote) {
        Silk.get('remote/start')(true);
    }

    if (program.open) {
        require('./core/nw/open.js')(program.devtools);
    }
}
start();
