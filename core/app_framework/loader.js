var App = require('./app.js');

var Loader = {
  apps: {},
  add: function (path, expressApp, next) {
    var self = this;

    if (path in self.apps) {
      console.log('app found');
      next(null, self.apps[path]);
    } else {
      self.apps[path] = new App(path, expressApp, function (err, app) {
        if (err) {
          return next(err, app);
        }

        if (self.apps[path].fileSystem || self.apps[path].isService) {
          console.log('starting app');
          self.apps[path].start(function () {
            next(err, app);
          });
        } else {
          next(err, app);
        }
      });
    }
  }
};

module.exports = Loader;
