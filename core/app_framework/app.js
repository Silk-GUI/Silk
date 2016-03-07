var async         = require('async'),
    events        = require('events'),
    fs            = require('fs'),
    util          = require('util'),
    pathUtil      = require('path'),
    child_process = require('child_process'),
    lodash        = require('lodash'),
    npmi          = require('npmi');

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
 * Loads the package.json in the app's directory.
 * @param next - callback
 */
App.prototype.loadJSON = function loadJSON(next) {
  var self = this;
  fs.readFile(self.path + '/package.json', function (err, contents) {
    if(err) {
      return next(err);
    }
    try {
      var j = JSON.parse(contents);
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
    next(null, self.packageJson);
  });
};

App.prototype.installDeps = function installDeps(next) {
  var self = this;
  fs.readdir(self.path + '/node_modules', function (e, r) {
    if((e && e.code === 'ENOENT') || (r.length < lodash.keys(self.packageJson.dependencies).length / 2)) {
      console.log('installing deps');
      if(self.packageJson.scripts && self.packageJson.scripts['setup-silk']) {
        child_process.exec('npm run setup-silk', function () {
          console.log('finished npm run setup-silk');
        });
      } else if(self.packageJson.scripts && self.packageJson.scripts.setup) {
        child_process.exec('npm run setup', {
          cwd: self.path
        }, function () {
          console.log('finished npm run setup');
        });
      } else {
        npmi({
          path: self.path
        }, function (err, result) {
          console.log(err, result);
        });
      }

    } else {
      return next(e);
    }
  });
};

App.prototype.init = function init(next) {
  var self = this;
  async.series([self.loadJSON.bind(self), self.installDeps.bind(self)], function (err) {
    if(err) {
      console.log('error loading', self);
      console.log(err);
      return next(err);
    }
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

  //var modulePath = pathUtil.resolve(__dirname, '../fork_framework/fork_container/fork2server_com.js');
  var forkOpts = {
    cwd: __root,
    env: process.env,
    stdio: 'pipe'
  };
  self.fork = child_process.fork(this.path, [], forkOpts);

  setTimeout(function () {
    silkElectron.remove(self.path);
  }, 2000);
  self.fork.on('message', function (message) {
    if(message.cmd === 'ready') {
      self.state = 'running';

      next();
      self.fork.removeAllListeners();

    }
  });

};


module.exports = App;
