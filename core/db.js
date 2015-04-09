var Db = require('tingodb')().Db;
var settingsDir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
settingsDir += "/.silk-gui";
var db = new Db(settingsDir + '/core/database', {});
module.exports = db;