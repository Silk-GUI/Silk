/**
 * @file setups up Silk if it is a fresh install or didn't finish last time it was started
 */

var async = require('async');
var fs = require('fs');
var jsonFile = require('json-file');
var ghDownload = require('download-github-repo');
var path = require('path');

var __root = path.resolve(__dirname, '../../');

var data;

// load settings or create if it doesn't exist
try {
  data = jsonFile.read(__root + '/core/settings/setup.json');
} catch (e) {
  fs.writeFileSync(__root + '/core/settings/setup.json', '{"done" : false}');
  data = jsonFile.read(__root + '/core/settings/setup.json');
}

function installWM(repo, cb) {
  console.log('installing the window manager');

  ghDownload(repo, __root + '/window-manager', function (err) {
    console.log('finished');
    console.log(err);
    return cb(err);
  });
}
function installApps(list, cb) {
  console.log('installing apps into ' + __root + '/apps/');
  async.eachSeries(list, function (item, next) {
    console.log('installing ', item);
    ghDownload(item, __root + '/apps/' + item.replace('/', '-'), function (err) {
      if (!err) {
        console.log('finished');
      }
      return next(err);
    });
  }, function (err) {
    if (err) {
      console.log('error installing apps');
      return cb(err);
    }
    console.log('finished installing apps');
    data.set('done', true);
    data.writeSync();
    cb(err);
  });
}
/**
 * Installs apps listed in setup.json into app folder
 */
module.exports = function (cb) {
  var list;
  cb = cb || function () {};

  console.log('setting up');
  data.writeSync();

  // get list of apps
  try {
    list = fs.readFileSync(path.join(__root, 'config.json'));
    list = JSON.parse(list);
  } catch (e) {
    return cb(e);
  }
  installWM(list.windowManager, function (err) {
    if (err) {
      return cb(err);
    }
    console.log('installing apps');
    installApps(list.apps, function (err) {
      return cb(err);
    });
  });
};

/**
 * @returns {boolean} if the setup is done
 */
module.exports.ready = function () {
  return data.get('done');
};

if (module.parent === null) {
  // run with npm run setup[-force]
  if (module.exports.ready() === true) {
    console.log('Silk is already setup.');
    if (process.argv[2] !== '--force') {
      console.log('Use "npm run setup-force" to setup again');
      // we are finished
    } else {
      // force is so we can continue
      console.log('Ran with --force.  Continueing ...');
      module.exports(function (err) {
        if (err) {
          console.log('error setting up silk: ', err);
          console.log('please report this at https://github.com/Silk-GUI/Silk/issues');
          // throwing so prepublish script cancels publishing
          throw err;
        }
        console.log('finished setting up!');
      });
    }
  } else {
    module.exports();
  }
}
