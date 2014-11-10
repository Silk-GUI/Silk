var fs = require('fs');
var mime = require("mime")


function parsePath(path){
  var files = fs.readdirSync(path);
  for(var i=0;i<files.length;i++){
    files[i] = {
      name: files[i],
      path:path+files[i],
    }
    var stats = fs.statSync(files[i].path);
    files[i].isDir = stats.isDirectory();
    if(!files[i].isDir)
      files[i].mime = mime.lookup(files[i].path);
  }
}



methods.add({
  "fe/list/path": function (path,call_ob,next) {
    if(typeof path == "undefined")
      path = "/";
    else
      path = path[0];
    if(!/^\/$/.test(path))
      path += "/";
    if(!fs.exists(path))
      throw new Error("path:"+path+" doesn't exist")
    if(!fs.statSync(.path).isDirectory())
      throw new Error("path:"+path+" is not a dirctory")
    return parsePath(path);
  }
})
