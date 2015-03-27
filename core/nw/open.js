/**
* @file opens Silk in a nw.js window
*/
module.exports = function (toolbar) {
var nw = require('nw').findpath();
var exec = require('child_process').exec;
nw += " " + __root + '/core/nw';
if(toolbar === true) {
	nw += ' --url=file:///' + __root + '/core/nw/index.html?devtools=true';
}

exec(nw, function (err) {console.log('error: ', err);});
console.log('opening nw.js');
};