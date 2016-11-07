var db = require('../core/db.js');

function addApp(path) {
  var externalApps = db.collection('external_apps');
  path = path || process.cwd();

  console.log('adding ' + path);

  externalApps.findOne({ path: path }, function (err, data) {
    if (err) {
      console.log('error');
      console.log(err);
      return;
    }
    if (data !== null) {
      console.log('app already added');
      return;
    }
    externalApps.insert({ path: path }, function (err) {
      if (err) {
        console.log('error');
        console.log(err);
        return;
      }
      console.log('Successfully added app!');
    });
  });
}

module.exports = addApp;
