// API for apps.  Available in app forks.
var silkMethods = {};

var requests = [];

silkMethods['apps/list'] = function () {
  console.log(Silk.get('apps/appLoader').clean)
  return Silk.get('apps/appLoader').clean;
}

silkMethods['apps/restart'] = function (name, message) {
  console.log("requested to restart " + name);
  console.dir(Silk.get('apps/appLoader').hashmap);
  Silk.get("apps/appLoader").restartSingle(Silk.get('apps/appLoader').hashmap[name], function (result) {
    console.log("result from restart:")
    console.log(result);
  });

}

silkMethods['apps/start'] = function (folder, message) {
  console.log('starting' + name);
  var appLoader = Silk.get('apps/appLoader');
  appLoader.startSingle(folder, function (err, j){
    if(err) console.log(err);
    appLoader.emit('finishedCompiling', appLoader.clean);
  })
};

module.exports.methods = silkMethods;

module.exports.call = function (message, fork) {
  var error = null;
  var result = null;
  try {
    var result = silkMethods[message.message.method](message.message.data);
  } catch (e) {
    var error = e;
  }
  console.log(result);
  console.dir(error);
  fork.send({
    cmd: "silkMethod",
    message: {
      id: message.message.id,
      error: error,
      result: result
    }
  })


}