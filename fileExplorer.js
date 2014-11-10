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

var watchers = {};

function setupWatcher(path,call_ob,next){
  if(call_ob.id in watchers)
    watchers[call_ob.id].close();
  watchers[call_ob.id] = fs.watch(path, function (event, filename) {
    console.log('event is: ' + event);
    if (filename) {
      console.log('filename provided: ' + filename);
    } else {
      console.log('filename not provided');
    }
    next(void(0),parsePath(path));
  });
  call_ob.ws.on("close", function(){
    watchers[call_ob.id].close();
    delete watchers[call_ob.id];
  })
}

methods.add({
  "fe/list/path": function (path,call_ob,next) {
    if(typeof path == "undefined")
      path = "/";
    else
      path = path;
    if(!/\/$/.test(path))
      path += "/";
    if(!fs.existsSync(path)){
      throw new Error("path:"+path+" doesn't exist")
    }
    if(!fs.statSync(path).isDirectory()){
      throw new Error("path:"+path+" is not a dirctory")
    }
    setupWatcher(path,call_ob,next);
    return parsePath(path);
  }
})
