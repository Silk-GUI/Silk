

methods.add({
  "te/open": function(file, callObj, send){
    var fs = require("fs");
    var fileName = file;
    console.log("fileName");
    fs.exists(fileName, function(exists) {
      if (!exists) return send("this file does not exist");

      fs.stat(fileName, function(err, stats) {
        if(err) return send(err);
        if(stats.isDirectory())
          return send(new Error("Editing directories in a text editor is not currently supported"));
        fs.readFile(fileName,function(err,data){
          if(err) return send(err);
          var ret = {
            state: "ready",
            content: data.toString("utf-8")
          }
          send(void(0), ret);
        })
      });
    });
    return {state: "loading"}
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
