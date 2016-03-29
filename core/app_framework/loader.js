var App = require('./app.js');

var Loader = {
  apps: {},
  add: function (path, expressApp, next) {
    var self = this;

    if (path in self.apps) {
      console.log('app found');
      next(null, self.apps[path]);
    } else {
      self.apps[path] = new App(path, expressApp, next);
    }
  }
};

module.exports = Loader;
