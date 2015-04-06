var Db = require('tingodb')().Db;
var db = new Db(__root + '/core/database', {});
module.exports = db;
