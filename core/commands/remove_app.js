var db = require('../db.js');

var externalApps = db.collections.appId;

function removeApp (path) {
  console.log('removing app ' + path);
  externalApps.remove({path: path}, function () {
    console.log('finished');
  });
}

module.exports = removeApp;
