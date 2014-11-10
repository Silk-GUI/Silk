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
  return files;
}



methods.add({
  "fe/list/path": function (path,ws,next) {
    if(typeof path == "undefined")
      path = "/";
    else
      path = path[0];
    if(!/^\/$/.test(path))
      path += "/";
    if(!fs.existsSync(path))
      throw new Error(path+" doesn't exist");
    var stats = fs.statSync(path);
    if(!stats.isDirectory())
      throw new Error(path+" is not a directory");

    var watcher = fs.watch(path, function (event, filename) {
      console.log('event is: ' + event);
      if (filename) {
        console.log('filename provided: ' + filename);
      } else {
        console.log('filename not provided');
      }
      next(void(0),parsePath(path));
    })
    ws.on("close",function(){
      watcher.close();
    })


    return parsePath(path);
  }
})
