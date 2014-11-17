var fs = require("fs");
var url = require("url");
module.exports = function(req,res,next){
  var path = url.parse(req.originalUrl).pathname;
  if(!/^\/?bc\/.*/.test(path)) return next();
  if(/.*\/\.\.?\/.*/.test(path)) return next();
  if(/.*\/\/.*/.test(path)) return next();
  path = __root+"/bower_components/"+path.split("/").slice(2).join("/");
  fs.readFile(path+"/bower.json",function(err,file){
    if(err) return next();
    file = JSON.parse(file);
    if(!("main" in file)) return next();
    res.sendFile(path+"/"+file.main);
  })
};
