var async = require('async');
var events = require('events');
var fs = require('fs');
var util = require('util');
var pathUtil = require('path');
var childProcess = require('child_process');
var npmi = require('npmi');
var methods = require('../fork_framework/ws2fork_com.js');
var db = require('../db.js');
var silkElectron = require('silk-electron');

// start higher to not conflict with old app loader
var nextId = 500;

/**
 * Manages a single app
 * This will usually be used indirectly through the app loader which
 * will handle events. If that is not needed this can be used directly.
 */
function App(path, expressApp, next) {
  var self = this;

  self.id = nextId;
  nextId += 1;

  self.state = 'stopped';
  self.path = path;
  self.packageJson = {};
  self.expressApp = expressApp;

  process.nextTick(self.init.bind(self, next));
}

util.inherits(App, events.EventEmitter);

/**
 * Loads the app's id from the database
 * @param next
 */
App.prototype.loadId = function loadId(next) {
  var self = this;
  db.collections.appId.findOne({ path: self.path }, function (err, data) {
    if (data === undefined || data === null) {
      db.collections.appId.insert({ path: self.path }, function (err, document) {
        if (err) {
          return console.log(err);
        }
        self.id = document._id;
        return next(err, document._id);
      });
    } else {
      self.id = data._id;
      next(err, data._id);
    }
  });
};

/**
 * Loads the package.json in the app's directory.
 * @param next - callback
 */
App.prototype.loadJSON = function loadJSON(next) {
  var self = this;
  var j;

  fs.readFile(self.path + '/package.json', function (err, contents) {
    if (err) {
      return next(err);
    }
    try {
      j = JSON.parse(contents);
      self.packageJson = j;
      self.name = j.name;
      self.title = self.name;
      self.url = j.silk.url;
      self.icon = j.icon;

      self.expressApp.get('/icon/' + self.name, function (req, res) {
        res.sendfile(pathUtil.resolve(self.path, self.icon), function () {
          res.end();
        });
      });
    } catch (e) {
      console.log(e);
      return next(new Error('Error parsing package.json.'));
    }
    return next(null, self.packageJson);
  });
};

App.prototype.installDeps = function installDeps(next) {
  var self = this;
  var finishedSetup = db.collections.finishedSetup;

  function finish() {
    finishedSetup.insert({ path: self.path });
  }

  finishedSetup.findOne({ path: self.path }, function (err, document) {
    if (err) {
      return next(err);
    }
    if (document === null) {
      // setup never finished. run it now
      if (self.packageJson.scripts && self.packageJson.scripts['setup-silk']) {
        childProcess.exec('npm run setup-silk', function () {
          console.log('finished npm run setup-silk');
          finish();
          next();
        });
      } else if (self.packageJson.scripts && self.packageJson.scripts.setup) {
        childProcess.exec('npm run setup', {
          cwd: self.path
        }, function () {
          console.log('finished npm run setup');
          finish();
          next();
        });
      } else {
        npmi({
          path: self.path
        }, function (err) {
          console.log('finished npm install');
          finish();
          next(err);
        });
      }
    } else {
      next(null);
    }
  });
};

App.prototype.init = function init(next) {
  var self = this;
  async.series([
    self.loadJSON.bind(self),
    self.installDeps.bind(self),
    self.loadId.bind(self)
  ], function (err) {
    if (err) {
      console.log('error loading', self);
      console.log(err);
      return next(err);
    }
    console.log('id ' + self.id);
    next(null, self);
  });
};

App.prototype.clean = function clean() {
  var self = this;
  return {
    id: self.id,
    name: self.name,
    url: self.url,
    title: self.title,
    path: self.path,
    icon: '/icon/' + self.name
  };
};

App.prototype.start = function start(next) {
  var self = this;
  var forkOpts = {
    cwd: __root,
    env: process.env,
    stdio: 'pipe'
  };

  // check if it has server
  try {
    require.resolve(self.path);
  } catch (e) {
    // has no server.
    this.state = 'started';
    return next();
  }

  // now actually try to start it
  self.state = 'starting';

  // we first need to link the modules electron provides
  silkElectron.add(self.path);


  self.fork = childProcess.fork(this.path, [], forkOpts);
  methods.addFork(self.fork);
  setTimeout(function () {
    silkElectron.remove(self.path);
  }, 2000);
  self.fork.on('message', function (message) {
    if (message.cmd === 'ready') {
      self.state = 'running';
      next();
      self.fork.removeAllListeners();
    }
  });
};

module.exports = App;
