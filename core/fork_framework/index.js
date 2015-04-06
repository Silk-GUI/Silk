var appLoader = require(__dirname + '/app_loader.js'),
    db = require(__root + '/core/db.js'),
    db2 = require(__root + '/core/db.js'),
    methods = require(__dirname + "/ws2fork_com.js"),
    connId = 0,
    apps;

// get list of external apps;
var externalApps = db.collection("external_apps");


module.exports = function (app, wss, next) {
  // external apps
  var externalList = externalApps.find();
  function externalApp(item) {
    appLoader.add(item.path, app, function(err, data) {
      console.log('apploader err ', err);
      console.log('appLoader data ', data);
    });
  }
  externalList.toArray(function (err, docs) {
    if(err) {
      return;
    }
    for(var i = 0; i < docs.length; ++i) {
      externalApp(item);
    }
  });

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