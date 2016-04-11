var path = require('path');
var __api = path.join(__dirname, 'client_api');
var bowerstatic = require(path.join(__dirname, 'bower_static.js'));
var async = require('async');
var fs = require('fs');
var logger = require('./console.js').log;

module.exports = function (req, res, next) {
  res.setHeader('content-type', 'application/javascript');
  bowerstatic.raw('/bc/eventEmitter', function (ee) {
    logger.debug(ee);
    bowerstatic.raw('/bc/rsvp', function (rsvp) {
      logger.debug(rsvp);
      async.eachSeries([
        ee,
        rsvp,
        path.join(__api, '/abstract/StreamPromise.js'),
        path.join(__api, '/abstract/MessageRouter.js'),
        path.join(__api, '/abstract/MessageWriter.js'),
        path.join(__api, '/abstract/MessageDuplex.js'),
        path.join(__api, '/window/Window2Server_com.js'),
        path.join(__api, '/window/WindowAbstract.js'),
        path.join(__api, '/window/FrameContext.js'),
        path.join(__api, '/window/WindowManager.js'),
        path.join(__api, '/window/Window2Server_com.js'),
        path.join(__api, '/network/NetworkHost.js'),
        path.join(__api, '/network/NetworkUser.js')
      ], function (file, next) {
        var temp = fs.createReadStream(file, { encoding: 'utf-8' });
        temp.on('data', res.write.bind(res));
        temp.on('end', next);
        temp.on('error', next);
      }, function (err) {
        if (err) return next(err);
        res.end();
      });
    });
  });
};
