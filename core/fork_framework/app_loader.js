var fs = require('fs'),
  events = require('events'),
  async = require('async'),
  util = require('util'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  url = require('url'),
  child_process = require('child_process');

/**
 * array of json of apps and an event emmitter.
 * @constructor
 */
var AppList = function () {
  this.clean = [];
}
util.inherits(AppList, events.EventEmitter);
/**
 * object of all apps
 */
var appList = new AppList();

module.exports.App = App;
module.exports.apps = appList;

/**
 * Finds all apps in the folder and constructs a new app for each
 * @param {string} folder - path to folder
 * @param {express app} expressApp - an express app for routing
 */
module.exports.compileFolder = function (folder, expressApp, next) {
  if (typeof folder === 'undefined') {
    throw Error('we need the path to the folder to compile');
  }

  if (!/\/$/.test(folder)) {
    folder += '/'
  };

  fs.readdir(folder, function (err, files) {
    async.filter(files, function (file, next) {
      fs.exists(folder + file + '/window.json', function (exists) {
        if (!exists) {
          return next(new Error('window.json does not exist for ' + file));
        }

        var app = new App(folder + file, expressApp);
        appList[app.folder] = app;
        app.once('ready', function (err) {
          if (err) {
            console.log(err);
            return next(err);
          }

          app.start(function (err, result) {
            if (!err) {
              appList.clean.push(app.clean);
              appList.emit('added', app);
              next();
            }
          })
        });

      })
    }, function (err, result) {
      next(err, result);
    })
  });

};


/**
 * Creates and manages an app
 * @constructor
 * @param {string} path - path to folder
 * @param {object} j - contents of window.json for app
 */
function App(path, expressApp, urlPath) {
  this.json = {};
  this.state = 'stopped';
  this.clean = {};
  this.path = path;
  this.folder = this.path.split('/');
  this.folder = this.folder[this.folder.length - 1] || this.folder[this.folder.length - 2];
  this.expressApp = expressApp;
  this.valid = false;
  var urlPath = urlPath || '';
  var createRouter = function () {
    if (this.json.url === 'headless') {
      return false;
    }
    this.router = express.Router();
    this.router.use(urlPath + '/' + this.folder, express.static(this.path + '/public'));
    this.expressApp.use(this.router);
  }.bind(this);

  /**
   * Loads window.json for app.  Automatically called when app is constructed.
   * @param {function} next - callback
   */
  this.loadJSON = function (next) {
    var that = this;
    fs.readFile(this.path + "/window.json", function (err, contents) {
      if (err) {
        console.log(err);
        return next(err);
      }
      try {
        that.json = JSON.parse(contents);
      } catch (err) {
        console.log(err);
        return next(err);
      }

      next();
    })
  }.bind(this);

  /**
   * Makes sure the window.json has the required fields and adds fields for window manager
   * @param {function} next - callback
   */
  var checkJSON = function (next) {
    var j = this.json;
    if (!j.url) {
      next(new Error(this.folder + ' window.json does not have a url'));
    }
    if (!j.name) {
      next(new Error(this.folder + ' window.json does not have a name'));
    }

    if (j.url !== 'headless') {
      j.zIndex = 0;
      j.running = false;
      j.minimized = true;
    }

    j.folder = this.folder;
    j.path = this.path;
    this.name = j.name;
    this.clean = JSON.parse(JSON.stringify(j));
    next(void(0), j);
  }.bind(this);

  /**
   * Makes urls in window.json absolute
   * @param {function} next - callback
   */
  var checkURLs = function (next) {
    var that = this;
    var j = this.json;

    if (j.url === "headless") {
      return next();
    }

    async.each(["url", "icon"], function (prop, next) {
      // we know there is a url or icon property if it is needed from checkJSON.
      if (!prop in j) {
        return next();
      }

      // create absolute url
      j[prop] = url.resolve("http://localhost:3000/" + urlPath + j.name + "/index.html", j[prop]);
      that.clean[prop] = j[prop];
      var parsed = url.parse(j[prop]);

      // if local file, make sure it exists.
      if (!url.host) {
        fs.exists(j.path, function (boo) {
          if (!boo) return next(new Error(that.name + ' ' + prop + " file does not exist"));
          next();
        })
      }

    }, function (err) {
      if (err) {
        return next(err);
      }
      next(void(0), j);
    })
  }.bind(this);

  /**
   * Validates window.json and fixes url
   * @param {function} next - callback
   */
  this.validate = function (next) {
    var that = this;
    async.series([
    checkJSON,
    checkURLs
  ], function (err, result) {
      if (err) {
        console.log('not valid');
        console.log(err);
        that.valid = false;
      } else {
        that.valid = true;
      }
      next(err, result);
    })
  }.bind(this);

  /**
   * Starts the fork process
   * @param {function} next - callback
   */
  this.start = function (next) {
    try {
      require.resolve(this.path);
      try {
        this.status = 'starting';
        var modulePath = __dirname + '/fork_container/fork2server_com.js';
        var forkOpts = {
          cwd: __root,
          env: {
            start: this.path
          }
        }
        var fork = child_process.fork(modulePath, [], forkOpts);
        this.fork = fork;
        var that = this;
        var timeout = setTimeout(function () {
          that.status = 'stopped';
          that.fork.removeAllListeners();
          fork.kill();
          return next(new Error(this.name + ' took too long to start.'));
        }, 5000)

        fork.once('message', function (m) {
          clearTimeout(timeout);
          fork.removeAllListeners();
          if (m.cmd !== 'ready') {
            this.status = 'stopped';
            fork.kill();
            return next(new Error(this.name + ' sending messages before initialization'));
          }
          this.status = 'running';
          next();
        })

      } catch (e) {
        next(e);
      }
    } catch (e) {
      // no serverside scripts
      next();
    }
  }.bind(this);

  var that = this;
  this.loadJSON(function (err) {
    if (err) {
      this.valid = false;
      return;
    }
    that.validate(function (err) {
      createRouter();
      that.emit('ready', err);
    })
  })
}

util.inherits(App, events.EventEmitter);