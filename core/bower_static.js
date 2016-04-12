var fs = require('fs');
var url = require('url');
var p = require('path');

function raw(path, next) {
  var wp = path.split('/').slice(2);
  var r;
  var f;
  path = __root + '/bower_components/' + wp[0] + '/';
  fs.readFile(path + 'bower.json', function (err, file) {
    if (err) {
      console.log('error reading ', path, '/bower.json');
      return next();
    }
    file = JSON.parse(file);
    if (!('main' in file)) {
      return next();
    }
    if (!Array.isArray(file.main)) {
      return next(p.resolve(path, file.main));
    }

    if (file.main.length === 1 && wp.length === 1) {
      return next(p.resolve(path, file.main[0]));
    }

    wp.shift();
    r = p.resolve(path, wp.join('/'));
    while (file.main.length > 0) {
      f = p.resolve(path, file.main.pop());
      if (f === r) {
        return next(r);
      }
    }
    return next();
  });
}

module.exports = function (req, res, next) {
  var path = url.parse(req.originalUrl).pathname;
  if (!/^\/?bc\/.*/.test(path)) {
    return next();
  }
  if (/.*\/\.\.?\/.*/.test(path)) {
    return next();
  }
  if (/.*\/\/.*/.test(path)) {
    return next();
  }
  raw(path, function (file) {
    if (file) return res.sendFile(file);
    next();
  });
};

module.exports.raw = raw;
