var express = require('express');
var appLoader = require(__dirname + '/app_loader.js'),
  db = require(__root + '/core/db.js'),
  methods = require(__dirname + "/ws2fork_com.js"),
  connId = 0,
  apps;

// get list of external apps;
var externalApps = db.collection("external_apps");

function loadExternalApps() {
  var externalList = externalApps.find();
  function externalApp(item) {
    appLoader.add(item.path, app, function (err, data) {
      console.log('apploader err ', err);
      console.log('appLoader data ', data);
    });
  }
  externalList.toArray(function (err, docs) {
    if (err) {
      // the setting folder doesn't exist
      if (err.code === 'ENOENT') {
        var settingsDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
        settingsDir += "/.silk-gui";
        console.log('creating settings folder at ' + settingsDir);
        var mkdirp = require('mkdirp');
        mkdirp.sync(settingsDir + '/core/database');
        // try again
        return loadExternalApps();
      }
    }
    for (var i = 0; i < docs.length; ++i) {
      externalApp(item);
    }
  });
}
module.exports = function (app, wss, next) {
  // external apps
  loadExternalApps();
  //internal apps
  appLoader.compileFolder(__root + '/apps', app, function (err) {
    next(err, appLoader.clean);
  });

  Silk.set("apps/list", appLoader.apps);
  Silk.set('apps/clean', appLoader.clean);
  Silk.set('apps/add', appLoader.add);
  appLoader.on("added", function (app) {
    if (app.state === 'running' || app.state === 'starting') {
      methods.addFork(app.fork);
      return;
    } else {
      app.once('ready', function (err) {
        if (err) {
          console.log(err);
          return;
        }
        methods.addFork(app.fork);
      });
    }

  });

  appLoader.on('change', function () {
    Silk.set('apps/clean', appLoader.clean);
  });

  wss.on('connection', function (conn) {
    conn.id = connId++;
    debug("connected");
    conn.on('data', function (message) {

      debug("websocket message: " + message);


      methods.call(conn, message);
    });
  });

};

// load window manager as an app
module.exports.startWindowManager = function (path, expressApp, callback) {
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
    //TODO: setup should install window manager in a subfolder that is name@githubUser
    path = __root + '/window-manager';
  } else {
    console.log('Loading window manager from ' + path);
  }
  var app = new appLoader.App(path, expressApp, '/');
  app.init({
    createRouter: false
  }, function (e, d) {
    expressApp.use(express.static(path + "/public"));
    expressApp.get('/', function (req, res) {
      res.sendFile(path + "/public/index.html");
    });
    //methods.addFork(app.fork);
    console.log('window manager', e, d);
    app.start(function (e, d) {
      methods.addFork(app.fork);
      callback(e, d);
    });

  });
};
