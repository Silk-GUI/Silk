methods.add({
  "te/open": function(file, callObj, send){
    var fs = require("fs");
var fileName = file;
 
fs.exists(fileName, function(exists) {
  if (exists) {
    fs.stat(fileName, function(error, stats) {
      fs.open(fileName, "r", function(error, fd) {
        var buffer = new Buffer(stats.size);
 
        fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
          var data = buffer.toString("utf8", 0, buffer.length);
 
          var ret = {
            state: "ready",
            content: data
          }
          send(error, ret);
          fs.close(fd);
        });
      });
    });
  }
});
      return {
  state: "loading"
}
  }

});

methods.add({
  "te/save" : function(data){
    var fs = require("fs");
    console.log(data);
    path = data.path;
    contents = data.contents;
    console.log("==========");
   // console.log(contents);
    fs.writeFile(path, contents, function (err) {
  if (err) return console.log(err);
  console.log("saved: " + path);
});
    console.log("finished");
  }
})