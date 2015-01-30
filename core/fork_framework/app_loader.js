var fs = require('fs'),
  events = require('events'),
  async = require('async'),
  util = require('util'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  url = require('url'),
  npmi = require('npmi'),
  bower = require('bower'),
  bowerJSON = require('bower-json'),
  chokidar = require('chokidar'),
  child_process = require('child_process');



/**
 * object of all apps
 */
var apps = {};
var clean = [];
var appLoader = new events.EventEmitter();
appLoader.clean = clean;
appLoader.App = App;
appLoader.apps = apps;


module.exports = appLoader;

/**
 * Finds all apps in the folder and constructs a new app for each
 * @param {string} folder - path to folder
 * @param {express app} expressApp - an express app for routing
 */
module.exports.compileFolder = function (folder, expressApp, next) {
  if (typeof folder === 'undefined') {
    throw Error('compileFolder needs path to folder');
  }

  if (!/\/$/.test(folder)) {
    folder += '/'
  };

  fs.readdir(folder, function (err, files) {
    if(err){
      next(err);
    }
    async.filter(files, function (file, next) {
      fs.exists(folder + file + '/app.json', function (exists) {
        if (!exists) {
          return next(new Error('app.json does not exist for ' + file));
        }

        var app = new App(folder + file, expressApp);
        apps[app.folder] = app;
        app.once('error', function (err){
          console.log(err);
          return next(err);
        });
        app.once('ready', function (err) {
          if (err) {
            console.log(err);
            return next(err);
          }

          app.start(function (err, result) {
            if (!err) {
              if (app.clean.url !== 'headless') {
                appLoader.clean.push(app.clean);
              }
              appLoader.emit('added', app);
              debug(app.name + ' is running');
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
 * @param {object} j - contents of app.json for app
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

  var watcher = chokidar.watch(this.path + '/app.json');
  watcher.on('change', function (path) {
    console.log('app.json changed');
    init();
    console.log('re initialized');
  });

  /**
   * Loads app.json for app.  Automatically called when app is constructed.
   * @param {function} next - callback
   */
  this.loadJSON = function (next) {
    var that = this;
    fs.readFile(this.path + "/app.json", function (err, contents) {
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
   * Makes sure the app.json has the required fields and adds fields for window manager
   * @param {function} next - callback
   */
  var checkJSON = function (next) {
    var j = this.json;
    if (!j.url) {
      next(new Error(this.folder + ' app.json does not have a url'));
    }
    if (!j.name) {
      next(new Error(this.folder + ' app.json does not have a name'));
    }

    if (j.url !== 'headless') {
      j.zIndex = 0;
      j.running = false;
      j.minimized = true;
    }
    try {
      if ('port' in j.remote) {
        Silk.get('remote/addPort')(j.remote.port);
      }
    } catch (e) {

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

    if (j.url === "headless") {
      return next();
    }

    async.each(["url", "icon"], function (prop, next) {
      // we know there is a url or icon property if it is needed from checkJSON.
      if (!prop in j) {
        return next();
      }

      // create absolute url
      j[prop] = url.resolve("http://localhost:3000/" + urlPath + j.folder + "/index.html", j[prop]);
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
   * Validates app.json and fixes url
   * @param {function} next - callback
   */
  this.validate = function (next) {
    debug('validating ' + this.path);
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
   * Installs dependencies
   */
  this.npmDependencies = function (next) {
    var d = this.json.npmDependencies || {};
    if (Object.keys(d).length === 0) {
      return next();
    }
    async.eachSeries(Object.keys(d), function (dep, next) {

      // check if installed
      try {
        require.resolve(dep);
        return next();
      } catch (e) {
        console.log('installing npm dependencies for' + this.name);
        var options = {
          name: dep, // your module name
          version: d[dep] // expected version [default: 'latest']
        };
        npmi(options, function (err, result) {
          if (err) {
            if (err.code === npmi.LOAD_ERR) console.log('npm load error');
            else if (err.code === npmi.INSTALL_ERR) console.log('npm install error');
            console.log(err.message);
            return next(err.message);
          }

          // installed
          console.log(options.name + '@' + options.version + ' installed successfully');
          next();
        });
      }

    }, function (err) {
      if (err) console.log(err);
      next();
    });
    debug('npm dependencies');
    var amount = d.length - 1;
    var done = 0;
    var errors = null;
  }

  /**
   * Installs Bower dependencies
   * @param {function} next - callback
   */
  this.bowerDependencies = function (next) {
    var d = this.json.bowerDependencies || {};
    if (Object.keys(d).length === 0) {
      // no dependencies
      return next();
    }
    async.eachSeries(Object.keys(d), function (dep, next) {
      bowerJSON.read(__root + "/bower_components/" + dep, function (err, file) {
        if (file) {
          return next();
        }
        var force = false;
        if (d[dep] === 'latest') {
          force = true;
        }
        console.log('installing ' + dep);
        bower.commands
          .install([dep + '#' + d[dep]], {
            save: false,
            force: true
          })
          .on('error', function (err) {
            console.log('error isntalling ' + dep);
            console.log(err);
            next();
          })
          .on('end', function (installed) {
            console.log('finished installing ' + dep);
            return next();
          })
      })
    }, function (err) {
      if (err) {
        console.log(err);
      }
      next(err);
    })

  }

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
          },
          silent: true,
          stdio: 'pipe'
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
        });
        fork.on('close', function (code, signal) {
          console.log('process for ' + that.name + 'ended');
        });

        fork.stdout.on('data', function (data) {
          console.log('[' + that.name + '] ' + data);
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
  var init = function () {
    this.loadJSON(function (err) {
      if (err) {
        this.valid = false;
        console.log(err);
        return;
      }
      that.validate(function (err) {
        that.bowerDependencies(function (err) {
          that.npmDependencies(function () {
            createRouter();
            that.emit('ready', err);
          })
        });
      })
    })
  }.bind(this);

  init();
}

util.inherits(App, events.EventEmitter);