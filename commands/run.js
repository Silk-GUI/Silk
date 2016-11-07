var express = require('express');
var SockJS = require('sockjs');
var program = require('commander');
var configJson = require('../config.json');
var logger = require('../core/console.js');
var apiData = require('../core/api_data.js');
var forkFramework = require('../core/fork_framework');

var app = express();
var server;
var wss;
var url;
var toLoad = 2;
var loaded = 0;

function run() {
  var sockOptions = {
    sockjs_url: '//cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js'
  };
  var spinner = new logger.Spinner('Starting Silk');
  spinner.start();

  // hides spinner and shows url when finished loading;
  function loader() {
    loaded += 1;
    logger.log.debug('finished loading ', loaded, toLoad);
    if (loaded === toLoad) {
      spinner.stop();
      process.stdout.write('\r ' + url);
      console.log('');
    }
  }

  // static files for client
  app.get(/^\/bc\//, require(__root + '/core/bower_static.js'));
  app.get('/api.js', require(__root + '/core/client_api.js'));

  server = app.listen(3000, function () {
    var address = server.address();
    url = 'Silk at http://localhost:' + address.port;
    loader();
  });

  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
      console.log('Another process is using port 3000');
    } else {
      console.trace(err);
    }
    process.exit();
  });

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

  forkFramework(app, wss, function () {
    loader();
  });

  forkFramework.startWindowManager(configJson.windowManager, app, function (e) {
    if (e) {
      console.log('error starting window manager');
      console.log(e);
    }
  });

  require('../core/remote.js');

  if (program.remote) {
    apiData.get('remote/start')(true);
  }

  if (program.open) {
    require('../electron/open.js')(program.devtools);
  }
}

module.exports = run;
