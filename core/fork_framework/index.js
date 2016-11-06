var express = require('express');
var mkdirp = require('mkdirp');
var _path = require('path');

var appLoader = require('./app_loader.js');
var db = require(__root + '/core/db.js');
var methods = require('./ws2fork_com.js');
var log = require('../console.js').log;
var apiData = require('../api_data.js');

var connId = 0;

// get list of external apps;
var externalApps = db.collection('external_apps');

function loadExternalApps(app) {
  function externalApp(item) {
    log.debug('loading external app ' + item.path);
    appLoader.add(item.path, app, function (err) {
      if (err) {
        console.log('error loading app');
        console.log(err);
      }
    });
  }

  externalApps.find()
    .toArray(function (err, docs) {
      var settingsDir;
      var i;

      if (err) {
        // the setting folder doesn't exist
        if (err.code === 'ENOENT') {
          settingsDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
          settingsDir += '/.silk-gui';
          console.log('creating settings folder at ' + settingsDir);
          mkdirp.sync(settingsDir + '/core/database');
          // try again
          return loadExternalApps();
        }

        console.trace('err with external list', err);
        return;
      }
      // console.dir(docs);
      for (i = 0; i < docs.length; ++i) {
        externalApp(docs[i]);
      }
    });
}

module.exports = function (app, wss, next) {
  // external apps
  loadExternalApps(app);
  // internal apps
  appLoader.compileFolder(__root + '/apps', app, function (err) {
    next(err, appLoader.clean);
  });

  apiData.set('apps/list', appLoader.apps);
  apiData.set('apps/clean', appLoader.clean);
  apiData.set('apps/add', appLoader.add);

  appLoader.on('added', function (app) {
    apiData.set('apps/clean', appLoader.clean);
    apiData.set('apps/list', appLoader.apps);
    if (app.state === 'running' || app.state === 'starting') {
      // methods.addFork(app.fork);
    } else {
      app.once('ready', function (err) {
        if (err) {
          console.log(err);
          return;
        }
        // methods.addFork(app.fork);
      });
    }
  });

  appLoader.on('change', function (app) {
    if (app.state === 'running' || app.state === 'starting') {
      methods.addFork(app.fork);
    }

    apiData.set('apps/clean', appLoader.clean);
    apiData.set('apps/list', appLoader.apps);
  });

  wss.on('connection', function (conn) {
    conn.id = connId++;
    log.debug('connected');
    conn.on('data', function (message) {
      log.debug('websocket message: ' + message);
      methods.call(conn, message);
    });
  });
};

// load window manager as an app
module.exports.startWindowManager = function (path, expressApp, callback) {
  var app;

  // check if path is local or a github repository
  var localPath = false;
  if (path.indexOf('/') === 0) {
    localPath = true;
  } else if (path.indexOf('./') === 0) {
    localPath = true;
  } else if (path.indexOf('../') === 0) {
    localPath = true;
  } else if (path.indexOf('~/') === 0) {
    localPath = true;
  }
  if (localPath === false) {
    // TODO: setup should install window manager in a subfolder that is name@githubUser
    path = __root + '/window-manager';
  } else {
    path = _path.resolve(__root, path);
    console.log('Loading window manager from ' + path);
  }
  app = new appLoader.App(path, expressApp, '/');
  app.init({
    createRouter: false
  }, function () {
    expressApp.use(express.static(path + '/public'));
    expressApp.get('/', function (req, res) {
      res.sendFile(path + '/public/index.html');
    });

    app.start(function (e, d) {
      methods.addFork(app.fork);
      callback(e, d);
    });
  });
};
