/**
 * @file setups up Silk if it is a fresh install or didn't finish last time it was started
 */

var async = require('async'),
    fs = require('fs'),
    jsonFile = require('json-file'),
    ghDownload = require('github-downloader');

// load settings or create if it doesn't exist
try {
    var data = jsonFile.read(__root + '/core/settings/setup.json');
} catch (e) {
    fs.writeFileSync(__root + '/core/settings/setup.json', '{"done" : false}');
    var data = jsonFile.read(__root + '/core/settings/setup.json');
}

function installWM(repo, cb) {
    console.log('installing the window manager');
    var options = {
        username: repo.split('/')[0],
        repo: repo.split('/')[1],
        output: __root + '/window-manager/'
    };
    ghDownload(options, function(err) {
        console.log('finished');
        console.log(err);
        return cb(err);
    });
}
/**
 * Installs apps listed in setup.json into app folder
 */
module.exports = function(cb) {
  cb = cb || function() {};
  var list;
  console.log('setting up');
  // check if it is already done
  if (data.get('done') === true) {
      return cb(new Error('already done setting up'));
  }

   data.writeSync();

   // get list of apps
   try {
       list = fs.readFileSync(__root + '/setup.json');
       list = JSON.parse(list);
   } catch (e) {
       return cb(e);
   }
   installWM(list.windowManager, function(err) {
     if(err) {
       return cb(err);
     }
     console.log('installing apps');
     async.eachSeries(list.apps, function(item, next) {
       console.log('installing ', item);
       var options = {
         username: item.split('/')[0],
         repo: item.split('/')[1],
         output: __root + '/apps/' + item.replace('/', '-')
       };
       ghDownload(options, function(err) {
         console.log('finished');
         console.log(err);
         return next(err);
         });
     }, function(err, result) {
        if (err) {
           console.log('error installing apps');
           return next(err);
        }
        console.log('finished installing apps');
        data.set('done', true);
        data.writeSync();
        cb(err);
     });
   });
};

/**
 * @returns {boolean} if the setup is done
 */
module.exports.ready = function() {
    return data.get('done');
};