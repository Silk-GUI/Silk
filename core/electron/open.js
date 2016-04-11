/**
* @file opens Silk in a nw.js window
*/
module.exports = function (toolbar) {
  var path = require('electron-prebuilt');
  var exec = require('child_process').exec;
  path += ' ' + __root + '/core/electron';
  if (toolbar === true) {
	  path += ' --url=file:///' + __root + '/core/nw/index.html?devtools=true';
}

  exec(path, function (err) {console.log('error: ', err);});
  console.log('opening nw.js');
};
