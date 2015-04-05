/**
* @file setups up Silk if it is a fresh install or didn't finish last time it was started
*/

var async = require('async'),
    fs = require('fs'),
	  jsonFile = require('json-file'),
	  ghDownload = require('github-downloader');
ghDownload.debug();
try {
  var data = jsonFile.read(__root + '/core/settings/setup.json');
} catch (e) {
  fs.writeFileSync(__root + '/core/settings/setup.json', '{"done" : false}')
}
/**
 * Installs packages listed in setup.json
 * Steps:
 * 1. create "Silk-Apps" folder in user's home dir.  The folder
 *    in NodeOS will be "Apps" instead (TODO).
 * 2. install apps listed in silk-setup.json into folder
 * 3. install window manager into __root/window_manager
 */
module.exports = function (cb) {
  cb = cb || function () {};
  console.log('setting up');
   // check if it is already done
  if(data.get('done') === true){
      return cb(new Error('already done setting up'));
  }

  data.writeSync();

  // get list of apps
  try {
    var list = fs.readFileSync(__root + '/setup.json');
    list = JSON.parse(list);
  } catch (e) {
    return cb(e);
  }
  async.eachSeries(list.apps, function (item, next) {
    console.log('installing ', item);
    var options = {
      username: item.split('/')[0],
      repo:  item.split('/')[1],
      output: __root + '/apps/' + item.replace('/', '-')
    };
    ghDownload(options, function (err) {
      console.log('finished');
      console.log(err);
      return next(err);
    });
  }, function (err, result) {
    if(err){
      console.log('error installing apps');
      return next(err);
    }
    console.log('finished installing apps');
    data.set('done', true);
    data.writeSync();
    cb(err);
  });

}

/**
 * @returns {boolean} if the setup is done
 */
module.exports.ready = function () {
    return data.get('done');
}


