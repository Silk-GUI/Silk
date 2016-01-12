var __api = __dirname+"/client_api";
var bowerstatic = require(__dirname+"/bower_static.js");
var async = require("async");
var fs = require("fs");
var logger = require("./console.js").log;

module.exports = function(req,res,next){
  res.setHeader('content-type', 'application/javascript');
	bowerstatic.raw("/bc/eventEmitter",function(ee){
    logger.debug(ee);
	bowerstatic.raw("/bc/rsvp",function(rsvp){
    logger.debug(rsvp);
  async.eachSeries([
		ee,
		rsvp,
    __api+"/abstract/StreamPromise.js",
    __api+"/abstract/MessageRouter.js",
    __api+"/abstract/MessageWriter.js",
    __api+"/abstract/MessageDuplex.js",
    __api+"/window/Window2Server_com.js",
    __api+"/window/WindowAbstract.js",
    __api+"/window/FrameContext.js",
    __api+"/window/WindowManager.js",
    __api+"/window/Window2Server_com.js",
    __api+"/network/NetworkHost.js",
    __api+"/network/NetworkUser.js",
  ],function(file, next){
    var temp = fs.createReadStream(file, {encoding:"utf-8"});
    temp.on('data',res.write.bind(res));
    temp.on('end',next);
    temp.on('error',next);
  },function(err){
    if(err) return next(err);
    res.end();
  });
	});
	});
};
