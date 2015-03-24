/**
* @file opens Silk in a nw.js window
*/
module.exports = function (toolbar) {
	console.log('toolbar ', toolbar);
var nw = require('nw').findpath();
var exec = require('child_process').exec;
var args = []
nw += " " + __root + '/core/nw';
if(toolbar === true) {
	nw += ' --url=file:///' + __root + '/core/nw/index.html?devtools=true';
}

exec(nw, function (err) {console.log('error: '); console.log(err)});
console.log('opening nw.js');
console.log(nw);
}