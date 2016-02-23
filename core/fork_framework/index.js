var express = require('express');
var appLoader = require(__dirname + '/app_loader.js'),
    db        = require(__root + '/core/db.js'),
    methods   = require(__dirname + "/ws2fork_com.js"),
    log       = require('../console.js').log,
    apiData   = require('../api_data.js'),
    connId    = 0,
    apps;

// get list of external apps;
var externalApps = db.collection("external_apps");

function loadExternalApps(app) {

  function externalApp(item) {
    console.log('loading external app ' + item);
    appLoader.add(item.path, app, function (err, data) {
      console.log('apploader err ', err);
      console.log('appLoader data ', data);
    });
  }

  externalApps.find()
    .toArray(function (err, docs) {
      if(err) {
        // the setting folder doesn't exist
        if(err.code === 'ENOENT') {
          var settingsDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
          settingsDir += "/.silk-gui";
          console.log('creating settings folder at ' + settingsDir);
          var mkdirp = require('mkdirp');
          mkdirp.sync(settingsDir + '/core/database');
          // try again
          return loadExternalApps();
        }

        console.trace('err with external list', err);
        return;
      }
      console.dir(docs);
      for (var i = 0; i < docs.length; ++i) {
        externalApp(docs[i]);
      }
    });
}
module.exports = function (app, wss, next) {
  // external apps
  loadExternalApps(app);
  //internal apps
  appLoader.compileFolder(__root + '/apps', app, function (err) {
    next(err, appLoader.clean);
  });

  apiData.set("apps/list", appLoader.apps);
  apiData.set('apps/clean', appLoader.clean);
  apiData.set('apps/add', appLoader.add);

  appLoader.on("added", function (app) {
    apiData.set('apps/clean', appLoader.clean);
    apiData.set('apps/list', appLoader.apps);
    methods.addFork(app.fork);
    if(app.state === 'running' || app.state === 'starting') {
      // methods.addFork(app.fork);
      return;
    } else {
      app.once('ready', function (err) {
        if(err) {
          console.log(err);
          return;
        }
        // methods.addFork(app.fork);
      });
    }

  });

  appLoader.on('change', function () {
    apiData.set('apps/clean', appLoader.clean);
    apiData.set('apps/list', appLoader.apps);
  });

  wss.on('connection', function (conn) {
    conn.id = connId++;
    log.debug("connected");
    conn.on('data', function (message) {

      log.debug("websocket message: " + message);


      methods.call(conn, message);
    });
  });

};

// load window manager as an app
module.exports.startWindowManager = function (path, expressApp, callback) {
  // check if path is local or a github repository
  var localPath = false;
  if(path.indexOf('/') === 0) {
    localPath = true;
  } else if(path.indexOf('./') === 0) {
    localPath = true;
  } else if(path.indexOf('../') === 0) {
    localPath = true;
  } else if(path.indexOf('~/') === 0) {
    localPath = true;
  }
  if(localPath === false) {
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

    app.start(function (e, d) {
      methods.addFork(app.fork);
      callback(e, d);
    });

  });
};
