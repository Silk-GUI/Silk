var appLoader = require(__dirname + '/app_loader.js'),
  apps,
  methods = require(__dirname + "/ws2fork_com.js"),
  connId = 0;

module.exports = function (app, wss, next) {
  appLoader.compileFolder(__root + '/apps', app, function (err) {
    next(err, appLoader.apps.clean);
  });

  Silk.set("apps/list", appLoader.apps);
  Silk.set('apps/clean', appLoader.apps.clean);

  appLoader.apps.on("added", function (app) {
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
      })
    }

  });

  app.get("/windows.json", function (req, res, next) {
    res.type("json").send(appLoader.apps.clean);
  });

  wss.on('connection', function (conn) {
    conn.id = connId++;
    debug("connected");
    conn.on('data', function (message) {

      debug("websocket message: " + message);


      methods.call(conn, message);
    });
  });

}