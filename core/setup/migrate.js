var db = require('../db.js');
var didSetup = require('./').ready;

module.exports = function () {
  // Apps that came with Silk will need to be setup again
  // TODO: only remove collectons for apps that come with silk.
  db.collections.finishedSetup.remove({});
};

if (module.parent === null) {
  module.exports();
}
