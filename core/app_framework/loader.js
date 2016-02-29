var App = require('./app.js');

var Loader = {
  apps: {},
  add: function (path, expressApp, next) {
    var self = this;

    if(path in self.apps) {
      return next(null, self.apps[path]);
    }

    self.apps[path] = new App(path, expressApp, next);
  }
};

module.exports = Loader;
