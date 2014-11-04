var fs = require('fs');




methods.add({
  "fe/list/path": function (path) {
    fs.readdir(path, function (err, files) {
      console.log(files);
    });
  },
  "fe/list/home": function () {
    var files = fs.readdirSync("/");
    return files
  }
})