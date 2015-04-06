var Db = require('tingodb')().Db;
console.log('init db');
var db = new Db(__root + '/core/database', {});
module.exports = db;
