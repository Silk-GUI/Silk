// API for apps.  Available in app forks.
var serverAPI = {};

var requests = [];

serverAPI['apps/list'] = function () {
  return Silk.get('apps/clean');
}

serverAPI['apps/restart'] = function (name, message) {
  Silk.get("apps/appLoader").restartSingle(Silk.get('apps/appLoader').hashmap[name], function (result) {});
}

serverAPI['apps/start'] = function (folder, message) {
  var appLoader = Silk.get('apps/appLoader');
  appLoader.getSingle(folder, function (err, j) {
    if (err) console.log(err);
    appLoader.emit('finishedCompiling', appLoader.clean);
  })
};

module.exports.methods = serverAPI;

module.exports.call = function (message, fork) {
  var error = null;
  var result = null;
  try {
    var result = serverAPI[message.message.method](message.message.data);
  } catch (e) {
    error = e;
  }
  fork.send({
    cmd: "server api",
    message: {
      id: message.message.id,
      error: error,
      result: result
    }
  })


}