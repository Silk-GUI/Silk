var fs = require("fs");
var url = require("url");
var p = require("path");
module.exports = function(req,res,next){
  var path = url.parse(req.originalUrl).pathname;
  if(!/^\/?bc\/.*/.test(path)) return next();
  if(/.*\/\.\.?\/.*/.test(path)) return next();
  if(/.*\/\/.*/.test(path)) return next();
  raw(path,function(file){
    if(file) return res.sendFile(file);
    next();
  });
};

function raw(path,next){
  path = path.split("/").slice(2);
  var wp = path;
  path = __root+"/bower_components/"+path[0]+"/";
  fs.readFile(path+"/bower.json",function(err,file){
    if(err) return next();
    file = JSON.parse(file);
    if(!("main" in file)) return next();
    if(!Array.isArray(file.main))
      return next(p.resolve(path,file.main));

    if(file.main.length == 1 && wp.length == 1)
      return next(p.resolve(path,file.main[0]));

    wp.shift();
    var r = p.resolve(path,wp.join("/"));
    while(file.main.length > 0){
      var f = p.resolve(path,file.main.pop());
      if(f == r)
        return next(r);
    }
    return next();
  });
}

module.exports.raw = raw;
