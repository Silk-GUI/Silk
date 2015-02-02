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
  //console.dir(message);
  if (message.type === 'listener') {
    console.log('creating listener');
    Silk.listen('apps/clean', function () {
      console.log('received change, will send to app');
      send(null, Silk.get('apps/clean'));
    });
  }
  return Silk.get('apps/clean');
};

serverAPI['apps/restart'] = function (name, message) {
  Silk.get("apps/appLoader").restartSingle(Silk.get('apps/appLoader').hashmap[name], function (result) {});
};

serverAPI['apps/start'] = function (folder, message) {
  var appLoader = Silk.get('apps/appLoader');
  appLoader.getSingle(folder, function (err, j) {
    if (err) console.log(err);
    appLoader.emit('finishedCompiling', appLoader.clean);
  });
};

module.exports.methods = serverAPI;

module.exports.call = function (message, fork) {
  var request = new Request(message, fork);
  request.exec();
};