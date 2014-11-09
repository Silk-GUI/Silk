var fs = require('fs');
var mime = require("mime")



methods.add({
  "fe/list/path": function (path) {
    if(typeof path == "undefined")
      path = "/";
    else
      path = path[0];
    if(!/\/$/.test(path))
      path += "/";
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
})
