// API for apps.  Available to app forks.
var db = require(__root + '/core/db.js');
var serverAPI = {};
var externalApps = db.collection('external_apps');
var apiData = require(__root + '/core/api_data.js');

// handle electron messages
var electronListeners = [];

function electronMessage(message) {
  electronListeners.forEach(function (listener) {
    listener(message);
  });
}

function Request(message, fork) {
  this.message = message;
  this.id = message.message.id;
  this.fork = fork;
}
Request.prototype.send = function (error, result) {
  try {
    this.fork.send({
      cmd: 'server api',
      message: {
        id: this.id,
        error: error,
        result: result
      }
    });
  } catch (e) {
    // fork has been stopped
  }
};

Request.prototype.exec = function () {
  var error;
  var result;
  var data = this.message.message.data;
  var message = this.message.message;
  try {
    result = serverAPI[this.message.message.method](data, message, this.send.bind(this));
  } catch (e) {
    console.log('caught error');
    console.log(e.stack);
    error = e;
  }
  // only send if something is returned.  If nothing is returned,
  // the api should use send().
  if (typeof error === 'undefined' && typeof result === 'undefined') {
    // nothing to send
    console.log('nothing returned for ' + this.message.message.method);
    return;
  }
  this.send(error, result);
};

// API for apps
serverAPI['apps/list'] = function (data, message, send) {
  if (message.type === 'listener') {
    apiData.watch('apps/clean', function (prop, oldValue, currentValue) {
      send(null, currentValue);
    });
  }
  return apiData.get('apps/clean');
};

serverAPI['apps/state'] = function (data, message, send) {
  var clean = apiData.get('apps/clean');
  var apps = apiData.get('apps/list');

  var results = [];
  if (message.type === 'listener') {
    apiData.watch('apps/list', function (prop, oldValue, currentValue) {
      results = [];
      clean.forEach(function (app) {
        app.state = currentValue[app.path].state;
        results.push(app);
      });
      send(null, results);
    });
  }
  clean.forEach(function (app) {
    app.state = apps[app.path].state;
    results.push(app);
  });
  return results;
};

serverAPI['apps/restart'] = function (path, message, send) {
  apiData.get('apps/list')[path].restart(function (err) {
    send(err);
    console.log('restarted', err);
  });
};

serverAPI['apps/add'] = function (path) {
  apiData.get('apps/add')(path, function (err) {
    if (err) {
      return;
    }
    console.log('started app');
  });
};

serverAPI['apps/start'] = function (path, message, send) {
  apiData.get('apps/list')[path].start(function (e, r) {
    send(e, r);
  });
};

serverAPI['apps/external/add'] = function (path, message, send) {
  // make sure it isn't already added
  externalApps.findOne({ path: path }, function (err) {
    if (err) {
      return send(err);
    }
    externalApps.insert({ path: path }, function (err) {
      send(err);
    });
  });
};

// API for window manager to communicate with electron apps
serverAPI['electron/windowRawEvents'] = function (path, message, send) {
  electronListeners.push(function (message) {
    send({
      window: message.window,
      app: message.app,
      name: message.name,
      value: message.value
    });
  });
};

// API for remote

// once remote notifies Silk global of changes,
// we can allow listeners.

// start remote connection for port
serverAPI['remote/start'] = function (port) {
  apiData.get('remote/start')(port);
};

serverAPI['remote/close'] = function (port) {
  apiData.get('remote/close')(port);
};

serverAPI['remote/ports'] = function () {
  return apiData.get('remote/ports');
};

serverAPI['remote/addPort'] = function (port) {
  apiData.get('remote/addPort')(port);
};

module.exports.methods = serverAPI;

module.exports.call = function (message, fork) {
  var request = new Request(message, fork);
  request.exec();
};

module.exports.electronMessage = electronMessage;
