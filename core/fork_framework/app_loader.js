var util = require("util")
var fs = require("fs");
var events = require("events");
var async = require("async");
var http = require("http");
var https = require("https");
var express = require("express");
var router = express.Router();
var url = require("url");
var child_process = require("child_process");
module.exports = AppFactory;

function AppFactory(folder, urlpath, app) {
  if (typeof folder == "undefined")
    throw Error("In Order to use the abstract, you need to provide a folder to load from");
  if (!/\/$/.test(folder)) folder += "/";
  if (!/\/$/.test(urlpath)) urlpath += "/"
  this.folder = folder;
  this.urlpath = urlpath;
  this.hashmap = {};
  this.clean = []
  this.removed = [];
  this.router = express.Router();
  router.get(urlpath, function (req, res, next) {
    var t = url.parse(req.originalURL);
    t = t.substring(urlpath.length);
    t = t.substring(0, t.indexOf("/") || void(0));
    if (removed.indexOf(t) != -1)
      next(new Error("this application has been removed"))
    next();
  })
  var that = this;
  app.use(router)
  process.nextTick(this.compileFolder.bind(this));
  this.on("compiledSingle", function (j) {
    router.use(urlpath + j.name, express.static(folder + j.name + "/public"));
    router.get(urlpath + j.name, function (req, res, next) {
      res.redirect(301, j.url);
    });
    if (j.url != "headless") {
      debug("not headless")
      that.clean.push(j.clean);
    }
    delete j.clean;
    that.hashmap[j.name] = j;

  });
  fs.watch(this.folder, this.fsEvent.bind(this));
}
util.inherits(AppFactory, events.EventEmitter);

AppFactory.prototype.compileFolder = function (app) {
  var that = this;
  fs.readdir(this.folder, function (err, files) {
    async.filterSeries(files, function (file, next) {
      that.getSingle(file, function (err, j) {
        if (err) {
          console.log(file + " could not be loaded")
          console.log(err);
          return next(false)
        }
        next(true)
      })
    }, function (results) {
      that.completed = results;
      that.emit("finishedCompiling", results);
    });
  })
}

AppFactory.prototype.fsEvent = function (event, filename) {
  debug(event);
}
AppFactory.prototype.closeSingle = function (window, next) {
  if (!window.fork)
    return next(new Error("This window has no fork"))
  if (!window.fork.pid)
    return next(new Error("This fork is already gone"))
  try {
    window.fork.kill()
  } catch (e) {
    return next(e)
  }
  next(void(0), window);
}

AppFactory.prototype.deleteSingle = function (window, next) {
  fs.rmdir(window.path, function (err, res) {
    console.log(JSON.stringify(arguments));
    if (err) next(err)
    next(void(0), window);
  });
}

AppFactory.prototype.hideSingle = function (window, next) {
  var name = window.name;
  var i = 0;
  async.whilst(function () {
    return this.collection[i] && this.collection[i] != window
  }, function (next) {
    i++;
    process.nextTick(next)
  }, function () {
    if (!this.collection[i])
      next(new Error("there can't hide what doesn't exist"))
    delete this.collection[i];
    this.removed.push(name);
    next(void(0), window);
  })
}

AppFactory.prototype.restartSingle = function (window, next) {
  console.log("");
  console.log("");
  console.log("");
  console.dir(window);
  var path = window.path;
  window.fork.disconnect();
  window.fork.kill();
  console.log("killed process " + window.name);
  var that = this;
  this.getSingle(window.name, function (err, j) {
    if (err) {
      console.log(file + " could not be loaded")
      console.log(err);
      return next(false)
    }
    
    // remove old item (first) from clean
    for(var i = 0; i < that.clean.length; ++i){
      console.log(i);
      console.log(that.clean[i].name);
      console.log(j.name);
      if(that.clean[i].name === j.name){
        console.log("==== name same ====")
        that.clean.splice(i, 1);
        break;
      }
    }
    
    window = j;
    var results = [];
    // create array of results
    for (item in that.hashmap) {
      results.push(item);
    }

    that.emit("finishedCompiling", results);
    console.log("started " + window.name);
    next(true)
  })
}

AppFactory.prototype.checkWindowJSON = function (file, next) {
  var f = this.folder;
  fs.exists(f + file + "/window.json", function (boo) {
    if (!boo)
      return next(new Error(f + file + "/window.json does not exist."));
    fs.readFile(f + file + "/window.json", function (err, contents) {
      if (err)
        return next(err)
      try {
        var j = JSON.parse(contents);
      } catch (err) {
        return next(err);
      }
      if (!j.url) return next(new Error("URL is always standard"))
      if (!j.title) return next(new Error("for now, title is standard"))
      if (!j.icon) return next(new Error("for now, Logo is standard"))

      // add fields necessary for windows
      if (j.url !== 'headless') {
        j.zIndex = 0;
        j.running = false;
        j.minimized = true;
      }

      j.name = file;
      j.clean = JSON.parse(JSON.stringify(j));
      j.path = f + file;
      next(void(0), j);
    })
  })
}

AppFactory.prototype.checkURIs = function (j, next) {
  var that = this;
  if (j.url == "headless") {
    debug("headless");
    return next(void(0), j);
  }
  async.each(["url", "icon"], function (ns, next) {
    j[ns] = url.resolve("http://localhost:3000" + that.urlpath + j.name + "/index.html", j[ns]);
    j.clean[ns] = j[ns];
    var parsed = url.parse(j[ns]);
    if (!url.host) {
      fs.exists(j.path, function (boo) {
        if (!boo) return next(new Error("local file does not exist"));
        next();
      })
      return;
    }
    if (/^https/.test(j[ns]))
      https.request(j[ns], function (res) {
        if (res.statusCode >= 400)
          return next(new Error(j[ns] + " cannot be fulfilled " + res.statusCode));
      })
    else
      http.request(j[ns], function (res) {
        if (res.statusCode >= 400)
          return next(new Error(j[ns] + " cannot be fulfilled " + res.statusCode));
      })
  }, function (err) {
    if (err) next(err);
    next(void(0), j);
  })
};

AppFactory.prototype.checkNPMDeps = function (j, next) {
  if (!j.npm_dependencies) {
    j.npm_dependencies = {};
    j.npm_info = {
      already_install: [],
      new_install: [],
      all: []
    };
    return next(void(0), j);
  }
  var ai = [];
  var ni = [];
  async.each(Object.keys(j.npm_dependencies), function (dep, next) {
    try {
      var loc = require.resolve(dep);
      ai.push({
        name: dep,
        path: loc
      });
      return next(void(0), dep);
    } catch (e) {
      console.log("this dependency does not exist");
      child_process.exec(
        "npm install " + dep + "@" + j.npm_dependencies[dep], {
          cwd: __root
        }, function (err, stout, sterr) {
          if (err) return next(err);
          try {
            var loc = require.resolve(dep);
            ni.push({
              name: dep,
              path: loc
            });
            return next(void(0), dep);
          } catch (e) {
            return next(e);
          }
        })
    }
  }, function (err, results) {
    if (err) return next(err);
    j.npm_info = {
      already_install: ai,
      new_install: ni,
      all: results
    };
    return next(void(0), j);
  })
};

AppFactory.prototype.checkBowerDeps = function (j, next) {
  if (!j.bower_dependencies) {
    j.bower_dependencies = {};
    j.bower_info = {
      already_install: [],
      new_install: [],
      all: []
    };
    return next(void(0), j);
  }
  var bowerJson = require('bower-json');
  var ai = [];
  var ni = [];
  async.each(Object.keys(j.bower_dependencies), function (dep, next) {
    bowerJson.read(__root + "/bower_components/" + dep, function (err, file) {
      if (file) {
        ai.push(dep)
        return next(void(0), dep);
      }
      child_process.exec(
        "bower install " + dep + (j.bower_dependencies[dep] == "latest" ?
          " --force-latest" :
          "#" + j.bower_dependencies[dep]
        ), {
          cwd: __root
        }, function (err, stout, sterr) {
          if (err) return next(err);
          bowerJson.read(__root + "/bower_components/" + dep, function (err, file) {
            if (err) return next(err);
            ni.push(dep);
            return next(void(0), dep);
          });
        })
    })
  }, function (err, results) {
    if (err) return next(err);
    j.bower_info = {
      already_install: ai,
      new_install: ni,
      all: results
    };
    return next(void(0), j);
  })
}

AppFactory.prototype.createFork = function (j, next) {
  var that = this;
  try {
    require.resolve(j.path);
    try {
      var fork = child_process.fork(
        __dirname + "/fork_container/fork2server_com.js", [], {
          cwd: __root,
          env: {
            start: j.path
          }
        }
      );
      j.fork = fork;
      var timeout = setTimeout(function () {
        fork.removeAllListeners();
        fork.kill();
        return next(new Error(j.title + "'s fork process timed out, this may be due to long syncrounous code on initialization'"));
      }, 5000);

      fork.once("message", function (m) {
        clearTimeout(timeout);
        fork.removeAllListeners();
        if (m.cmd != "ready") {
          fork.kill();
          return next(new Error("fork process sending messages before initialization"));
        }
        debug("forkready");
        that.emit("forked", fork, j);
        next(void(0), j);
      });
      fork.once("error", function (e) {
        clearTimeout(timeout);
        fork.removeAllListeners();
        return next(e);
      });
    } catch (e) {
      clearTimeout(timeout);
      fork.removeAllListeners();
      return next(e);
    }
  } catch (e) {
    console.log(j.name + " has no serverside scripts but that is ok")
    return next(void(0), j);
  }
}


AppFactory.prototype.getSingle = function (file, next) {
  async.waterfall([

    function (next) {
      next(void(0), file);
    },
    this.checkWindowJSON.bind(this),
    this.checkURIs.bind(this),
    this.checkNPMDeps.bind(this),
    this.checkBowerDeps.bind(this),
    this.createFork.bind(this)
  ], function (err, result) {
    if (err) return next(err);
    this.emit("compiledSingle", result)
    next(void(0), result)
  }.bind(this))
}