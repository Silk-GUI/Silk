var async         = require('async'),
    events        = require('events'),
    fs            = require('fs'),
    util          = require('util'),
    pathUtil      = require('path'),
    child_process = require('child_process');

var silkElectron = require('silk-electron');

var nextId = 0;

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
  self.expressApp = expressApp;
  self.packageJson = {};

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
      self.icon = pathUtil.resolve(self.path, self.icon || '');
    } catch (e) {
      console.log(e);
      return next(new Error('Error parsing package.json.'));
    }
    next(null, self.packageJson);
  });
};

App.prototype.init = function init(next) {
  var self = this;
  async.series([self.loadJSON.bind(self)], function (err) {
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
    url: self.url,
    title: self.title,
    path: self.path,
    icon: self.icon
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
    next();
    silkElectron.remove(self.path);
  }, 3000);

};


module.exports = App;
