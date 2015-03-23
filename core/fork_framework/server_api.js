// API for apps.  Available to app forks.

var serverAPI = {},
  requests = [];

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
  var error = null;
  var result = null;
  var data = this.message.message.data;
  var message = this.message.message;
  try {
    result = serverAPI[this.message.message.method](data, message, this.send.bind(this));
  } catch (e) {
    console.log('caught error', e);
    error = e;
  }
  this.send(error, result);
};

serverAPI['apps/list'] = function (data, message, send) {

  if (message.type === 'listener') {
    Silk.listen('apps/clean', function () {
      send(null, Silk.get('apps/clean'));
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

module.exports.methods = serverAPI;

module.exports.call = function (message, fork) {
  var request = new Request(message, fork);
  request.exec();
};