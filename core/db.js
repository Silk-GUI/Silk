var Db = require('tingodb')().Db;
var settingsDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
settingsDir += "/.silk-gui";
var db = new Db(settingsDir + '/core/database', {});
module.exports = db;

module.exports.collections = {
  externalApps: db.collection("external_apps"),
  appId: db.collection("app_id")
};

console.dir(new db.ObjectID().toHexString());
