// API for apps.  Available to app forks.
var db = require(__root + '/core/db.js'),
  serverAPI = {},
  requests = [],
  externalApps = db.collection('external_apps');

function Request(message, fork) {
  this.message = message;
  this.id = message.message.id;
  this.fork = fork;
}
Request.prototype.send = function (error, result) {
  console.log('sending');
  this.fork.send({
    cmd: 'server api',
    message: {
      id: this.id,
      error: error,
      result: result
    }
  });
};

Request.prototype.exec = function () {
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
  if(typeof error === "undefined" && typeof result === "undefined"){
    // nothing to send
    return;
  }
  console.log(typeof error);
  this.send(error, result);
};

//API for apps
serverAPI['apps/list'] = function (data, message, send) {

  if (message.type === 'listener') {
    Silk.watch('apps/clean', function (prop, oldValue, currentValue) {
      send(null, currentValue);
    });
  }
  return Silk.get('apps/clean');
};

serverAPI['apps/restart'] = function (folderName, message) {
  console.dir(Silk.get('apps/list')[folderName]);
  Silk.get('apps/list')[folderName].restart(function(err){
    console.log('restarted', err);
  });
};

serverAPI['apps/start'] = function (path, message) {
  Silk.get('aps/add')(path, function(err){
    if(err){
      return;
    }
    console.log('started app');
  });
};

serverAPI['apps/external/add'] = function (path, message, send) {
  // make sure it isn't already added
  externalApps.findOne({path: path}, function (err, data) {
    if(err) {
      return send(err);
    }
    externalApps.insert({path: path}, function (err, data) {
      send(err);
    });
  });
};

// API for remote

// once remote notifies Silk global of changes, 
// we can allow listeners.

// start remote connection for port
serverAPI['remote/start'] = function (port) {
  Silk.get('remote/start')(port);
};

serverAPI['remote/close'] = function (port) {
  Silk.get('remote/close')(port);
};

serverAPI['remote/ports'] = function () {
  return Silk.get('remote/ports');
};

serverAPI['remote/addPort'] = function (port) {
  Silk.get('remote/addPort')(port);
};

module.exports.methods = serverAPI;

module.exports.call = function (message, fork) {
  var request = new Request(message, fork);
  request.exec();
};