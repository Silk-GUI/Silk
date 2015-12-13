var fs            = require('fs'),
    events        = require('events'),
    async         = require('async'),
    util          = require('util'),
    express       = require('express'),
    url           = require('url'),
    npmi          = require('npmi'),
    bower         = require('bower'),
    bowerJSON     = require('bower-json'),
    chokidar      = require('chokidar'),
    child_process = require('child_process'),
    resolve       = require('resolve'),
    log           = require('../console.js').log,
    apiData       = require('../api_data.js');
/**
 * object of all apps
 */
var apps = {};
/**
 * Array of app properties
 */
var clean = [];
/**
 * id for apps.  Increased by one for each app.
 * @type {number}
 */
var id = 0;
var appLoader = new events.EventEmitter();
appLoader.clean = clean;
appLoader.App = App;
appLoader.apps = apps;

module.exports = appLoader;

/**
 * Finds all apps in the folder and constructs a new app for each
 * @param {string} folder - path to folder
 * @param {express app} expressApp - an express app for routing
 * @param {function} next - a callback
 */
module.exports.compileFolder = function (folder, expressApp, next) {
  if(typeof folder === 'undefined') {
    throw Error('compileFolder needs path to folder');
  }

  if(!/\/$/.test(folder)) {
    folder += '/';
  }

  fs.readdir(folder, function (err, files) {
    if(err) {
      next(err);
    }
    // tries to create an app for each folder.
    async.filter(files, function (file, next) {
      fs.exists(folder + file + '/app.json', function (exists) {
        if(!exists) {
          return next(new Error('app.json does not exist for ' + file));
        }
        var index;
        var app = new App(folder + file, expressApp);
        apps[app.folder] = app;
        app.on('change', function (type, property, oldValue) {
          console.log('appLoader caught change event');
          appLoader.clean[index] = app.clean;
          /*
           * Change event
           * An app's properties changed
           * @event appLoader#change
           */
          appLoader.emit('change');
        });
        app.init(function (err) {
          if(err) {
            console.log(err);
            return next(err);
          }

          app.start(function (err, result) {
            if(err) {
              log.debug('error starting ' + app.path, err);
              return next(err);
            }
            if(app.clean.url !== 'headless') {
              appLoader.clean.push(app.clean);
              index = appLoader.clean.length - 1;
            }
            appLoader.emit('added', app);
            log.debug(app.name + ' is running');
            next();

          });
        });

      });
    }, function (err, result) {
      next(err, result);
    });
  });

};

/**
 * Compiles an app
 * @param {string} path - path to app's folder. Do not end with a /
 * @param {object} expressApp - an express app that will be used for routing
 * @param {function} next - callback
 */
appLoader.add = function (path, expressApp, next) {
  log.debug(path + '/app.json');
  fs.exists(path + '/app.json', function (exists) {
    if(!exists) {
      return next(new Error("app doesn't have an app.json"));
    }
    var index;
    var app = new App(path, expressApp);
    apps[app.path] = app;
    app.on('change', function (type, property, oldValue) {
      appLoader.clean[index] = app.clean;
      /*
       * Change event
       * An app's properties changed
       * @event appLoader#change
       */
      appLoader.emit('change');
    });
    app.init(function (err) {
      if(err) {
        console.log(err);
        return next(err);
      }

      app.start(function (err, result) {
        if(err) {
          return next(err);
        }
        if(app.clean.url !== 'headless') {
          appLoader.clean.push(app.clean);
          index = appLoader.clean.length - 1;
        }
        appLoader.emit('added', app);
        log.debug(app.name + ' is running');
        next();

      });
    });
  });
};

/**
 * Creates and manages an app
 * @constructor
 * @param {string} path - path to folder
 * @param {express app} expressApp - an expressApp to use for routing
 * @param {string} urlPath - url path for routing.  Final route is urlPath/appFolderName/publicFile
 * @fires App#ready
 * @fires App#change
 */
function App(path, expressApp, urlPath) {
  if(!urlPath) {
    urlPath = '';
  }
  id += 1;
  this.id = id;
  this.json = {};
  this.state = 'stopped';
  this.clean = {};
  this.path = path;
  this.folder = this.path.split('/');
  this.folder = this.folder[this.folder.length - 1] || this.folder[this.folder.length - 2];
  this.expressApp = expressApp;
  this.valid = false;
  var that = this;

  /**
   * used to change property of app and emit change event
   * @fires changed
   */
  this.set = function (prop, value) {
    this[prop] = value;
    this.emit('change', prop);
  }.bind(this);

  var createRouter = function () {
    if(this.json.url === 'headless') {
      return false;
    }
    this.router = express.Router();
    this.router.use(urlPath + '/' + this.folder + this.id, express.static(this.path + '/public'));
    this.expressApp.use(this.router);
  }.bind(this);

  var watcher = chokidar.watch(this.path + '/app.json');
  watcher.on('change', function (path) {
    console.log('app.json changed');
    console.log(that.name);
    init(function (err) {
      /**
       * Change event
       * Something changed in the app.json
       * @event App#change
       */
      console.log(that.name);
      that.emit('change', err);
    });
    console.log('re initialized');
  });

  /**
   * Loads app.json for app.  Automatically called when app is constructed.
   * @param {function} next - callback
   */
  this.loadJSON = function (next) {
    var that = this;
    fs.readFile(this.path + "/app.json", function (err, contents) {
      if(err) {
        console.log(err);
        return next(err);
      }
      try {
        that.json = JSON.parse(contents);
      } catch (e) {
        var error = 'Error parsing JSON for ' + that.folder + ' app';
        console.log('error with parsing JSON');
        return next(e);
      }

      next();
    });
  }.bind(this);

  /**
   * Makes sure the app.json has the required fields and adds fields for window manager
   * @param {function} next - callback
   */
  var checkJSON = function (next) {
    var j = this.json;
    if(!j.url) {
      next(new Error(this.folder + ' app.json does not have a url'));
    }
    if(!j.name) {
      next(new Error(this.folder + ' app.json does not have a name'));
    }

    if(j.url !== 'headless') {
      j.zIndex = 0;
      j.running = false;
      j.minimized = true;
    }

    if(j.remote && 'port' in j.remote) {
      apiData.get('remote/addPort')(j.remote.port);
    }

    j.folder = this.folder;
    j.path = this.path;
    this.name = j.name;
    this.clean = JSON.parse(JSON.stringify(j));
    next(void(0), j);
  }.bind(this);

  /**
   * Makes urls in app.json absolute
   * @param {function} next - callback
   */
  var checkURLs = function (next) {
    var that = this;
    var j = this.json;

    if(j.url === "headless") {
      return next();
    }

    async.each(["url", "icon"], function (prop, next) {
      // we know the required urls are here from checkJSON
      /*jshint -W018 */
      if(!(prop in j)) {
        return next();
      }
      /*jshint +W018 */

      // create absolute url
      j[prop] = url.resolve("http://localhost:3000/" + urlPath + j.folder + that.id + "/index.html", j[prop]);
      that.clean[prop] = j[prop];
      var parsed = url.parse(j[prop]);

      // if local file, make sure it exists.
      if(!url.host) {
        fs.exists(j.path, function (boo) {
          if(!boo) return next(new Error(that.name + ' ' + prop + " file does not exist"));
          next();
        });
      }

    }, function (err) {
      if(err) {
        return next(err);
      }
      next(void(0), j);
    });
  }.bind(this);

  /**
   * calls this.checkJSON and this.checkURLs
   * @param {function} next - callback
   */
  this.validate = function (next) {
    log.debug('validating ' + this.path);
    var that = this;
    async.series([
      checkJSON,
      checkURLs
    ], function (err, result) {
      if(err) {
        console.log('not valid');
        console.log(err);
        that.valid = false;
      } else {
        log.debug(that.path + ' is valid');
        that.valid = true;
      }
      next(err, result);
    });
  }.bind(this);

  /**
   * Installs NPM dependencies
   * @param {function} next - callback
   */
  this.npmDependencies = function (next) {
    var d = this.json.npmDependencies || {};
    if(Object.keys(d).length === 0) {
      return next();
    }
    async.eachSeries(Object.keys(d), function (dep, next) {
      // check if installed
      try {
        // TODO make this async
        resolve.sync(dep, {basedir: that.path});
        return next();
      } catch (e) {
        console.log('installing' + dep + 'for ' + that.name);
        var options = {
          name: dep,
          version: d[dep],
          path: that.path,
          npmLoad: {
            loglevel: 'silent'
          }
        };
        npmi(options, function (err, result) {
          if(err) {
            if(err.code === npmi.LOAD_ERR) console.log('npm load error');
            else if(err.code === npmi.INSTALL_ERR) console.log('npm install error');
            console.log(err.message);
            return next(err.message);
          }

          // installed
          console.log(options.name + '@' + options.version + ' installed successfully');
          next();
        });
      }

    }, function (err) {
      if(err) console.log(err);
      next();
    });
    log.debug('npm dependencies');
    var amount = d.length - 1;
    var done = 0;
    var errors = null;
  };

  /**
   * Installs Bower dependencies
   * @param {function} next - callback
   */
  this.bowerDependencies = function (next) {
    var d = this.json.bowerDependencies || {};
    if(Object.keys(d).length === 0) {
      // no dependencies
      return next();
    }
    async.eachSeries(Object.keys(d), function (dep, next) {
      bowerJSON.find(__root + "/bower_components/" + dep, function (err, file) {
        if(file) {
          return next();
        }
        var force = false;
        if(d[dep] === 'latest') {
          force = true;
        }
        console.log('installing ' + dep);
        bower.commands
          .install([dep + '#' + d[dep]], {
            save: false,
            force: true,
            forceLatest: true
          })
          .on('error', function (err) {
            console.log('error installing bower dependency ' + dep + ' for ' + that.name);
            console.log(err);
            next();
          })
          .on('end', function (installed) {
            console.log('finished installing ' + dep);
            return next();
          });
      });
    }, function (err) {
      if(err) {
        console.log(err);
      }
      next(err);
    });

  };

  /**
   * Starts the fork process
   * @param {function} next - callback
   * @fires App#change
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
          },
          silent: true,
          stdio: 'pipe'
        };
        var fork = child_process.fork(modulePath, [], forkOpts);
        this.fork = fork;
        var that = this;
        var timeout = setTimeout(function () {
          var oldValue = that.status;
          that.status = 'error';
          /*
           * Changed event
           * The status changed
           * @event App#change
           */
          that.emit('changed');
          that.fork.removeAllListeners();
          fork.kill();
          return next(new Error(this.name + ' took too long to start.'));
        }, 5000);

        fork.once('message', function (m) {
          var oldValue = that.status;
          clearTimeout(timeout);
          fork.removeAllListeners();
          if(m.cmd !== 'ready') {
            that.status = 'error';
            fork.kill();
            /*
             * Changed event
             * the status changed
             * @event App#change
             */
            that.emit('changed');
            return next(new Error(that.name + ' sending messages before initialization'));
          }
          this.status = 'running';
          /*
           * Changed event
           * Status changed
           * @event App#change
           */
          that.emit('changed');
          next();
        });
        fork.on('close', function (code, signal) {
          console.log('process for ' + that.name + 'ended');
        });

        fork.stdout.on('data', function (data) {
          console.log('[' + that.name + '] ' + data);
        });
        fork.stderr.on('data', function (data) {
          console.log('[Error in ' + that.name + '] ' + data);
        });

      } catch (e) {
        next(e);
      }
    } catch (e) {
      // no serverside scripts
      next();
    }
  }.bind(this);

  this.stop = function (next) {
    if(this.state !== 'running' || this.state !== 'starting') {
      next();
    }
    this.fork.disconnect();
    this.fork.kill();
    this.fork.removeAllListeners();
    this.state = 'stopped';
    /*
     * Changed event
     * Status changed
     * @event App#change
     */
    that.emit('changed');
    next();
  }.bind(this);

  this.restart = function (next) {
    this.stop(function () {
      that.start(function (err) {
        next(err);
      });
    });
  }.bind(this);

  /**
   * Loads app.json, validates it, installs bower and npm dependencies, and then
   * optionally creates the router.
   *
   * @param {boolean} options.createRouter - if false, the router is not created
   */
  this.init = function (options, next) {
    if(typeof options === "function") {
      next = options;
    }
    this.loadJSON(function (err) {
      if(err) {
        this.valid = false;
        return next(err);
      }
      that.validate(function (err) {
        if(err) {
          next(err);
        }
        that.bowerDependencies(function (err) {
          if(err) {
            next(err);
          }
          that.npmDependencies(function (err) {
            if(!(options && options.createRouter)) {
              createRouter();
            }
            return next(err);
          });
        });
      });
    });
  }.bind(this);
}

util.inherits(App, events.EventEmitter);
