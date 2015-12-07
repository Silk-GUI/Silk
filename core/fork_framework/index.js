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
    if (app.status === 'running' || 'starting') {
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

  app.get("/windows.json", function (req, res, next) {
    res.type("json").send(appLoader.clean);
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
module.exports.startWindowManager = function (expressApp, callback) {
  var app = new appLoader.App(__root + '/window-manager', expressApp, '/');
  app.init({
    createRouter: false
  }, function (e, d) {
    expressApp.use(express.static(__root + '/window-manager/public'));
    expressApp.get('/', function (req, res) {
      res.sendFile(__root + "/window-manager/public/index.html");
    });
    //methods.addFork(app.fork);
    console.log('window manager', e, d);
    app.start(function (e, d) {
      methods.addFork(app.fork);
      callback(e, d);
    });

    })
}