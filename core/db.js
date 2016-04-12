var Db = require('tingodb')().Db;
var homeDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var settingsDir = homeDir + '/.silk-gui';
var db = new Db(settingsDir + '/core/database', {});
module.exports = db;

module.exports.collections = {
  externalApps: db.collection('external_apps'),
  appId: db.collection('app_id'),
  finishedSetup: db.collection('appFinishedSetup')
};
