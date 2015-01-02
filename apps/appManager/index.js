var request = require('request');
var fs = require('fs');
var path = require('path');
var yauzl = require("yauzl");
var mkdirp = require('mkdirp');
var async = require('async');

var methods = Silk.methods;
var apps = [];
var appsFolder = __dirname.split(path.sep);
appsFolder = appsFolder.slice(0, appsFolder.length - 1);
appsFolder = appsFolder.join(path.sep);

methods.add({
  "apps/remove": function (data, call_obj, send) {
    send(void(0), "Deleting...");
    
    var file = data.folder;
    var folder = appsFolder + path.sep + file;
    console.log(folder);
    var deleteFolderRecursive = function (path) {
      if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
          var curPath = path + "/" + file;
          if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
        console.log("Finished removing");
        send(void(0), " ");
      }
    };
    deleteFolderRecursive(folder);
  },
  "apps/list": function (data, call_obj, send) {
    fs.readdir(appsFolder, function (err, files) {
      if (err) {
        send(err);
      }
      apps = [];
      async.each(files, function (file, next) {
        console.log("each");
        console.log(apps);
        console.log(appsFolder + path.sep + file + "/window.json");
        fs.exists(appsFolder + path.sep + file + "/window.json", function (exists) {
          if (!exists) {
            console.log("file doesn't exist");
            return next(new Error(appsFolder + file + "/window.json does not exist."));
          }


          fs.readFile(appsFolder + path.sep + file + "/window.json", function (err, contents) {
            console.log(contents);
            if (err) {
              console.log(err);
              return next(err)
            }
            try {
              var j = JSON.parse(contents);
            } catch (err) {
              return next(err);
            }
            if (!j.url) {
              console.log("URL is always standard");
              return next(new Error("URL is always standard"))
            }
            if (!j.title) return next(new Error("for now, title is standard"))
            if (!j.icon) return next(new Error("for now, Logo is standard"))
            j.name = file;
            j.path = appsFolder + path.sep + file;

            console.log(j.name);
            // no erros.  add to apps
            apps.push(j);
            console.log("no errors");

            // was being sent before all complete so sending every time
            send(void(0), apps);
            return next();
          })
        })
      }, function (err) {
        console.log(err);
        console.log("list done");
        console.dir(apps);
        send(void(0), apps);
      });
      console.log(err);
      console.dir(files);

    });

  },
  "apps/install": download
});

function download(data, call_ob, send) {

  fs.exists(appsFolder + path.sep + data.url.replace("/", "-"), function (exists) {
    if (exists === true) {
      send(new Error("App already exists"));
      return;
    }

    if (data.url === "") {
      send(new Error("Url can not be empty"));
    }
    var repo = data.url;

    var url = "https://api.github.com/repos/" + repo + "/zipball";
    console.log("url is " + url);
    var options = {
      url: url,
      headers: {
        'User-Agent': 'silk-gui'
      }
    };

    send(void(0), "Downloading...");
    request(options).on('response', function (response) {
      console.log(response.statusCode);
      console.log(response.headers['content-type]']);
    }).on('error', function (err) {
      send(err)
    }).on("end", function () {
      send(void(0), "pending");
      install(data, call_ob, send)
    }).pipe(fs.createWriteStream(__dirname + path.sep + 'test.zip'));

  });
}

function install(data, call_ob, send) {
  send(void(0), "Installing ...");
  var extractTo = appsFolder + path.sep + data.url.replace("/", "-");
  try {
    yauzl.open(__dirname + path.sep + 'test.zip', function (err, zipfile) {
      if (err) {
        send(err);
        return;
      }
      zipfile.once('end', function () {
        send(void(0), "Finished installing!")
        console.log("deleting file");
        fs.unlink(__dirname + path.sep + 'test.zip', function (err) {
          console.log("finished deleting");
          if (err) {
            send(err);

          }
          send(void(0), " ");
        })
      });
      zipfile.on("entry", function (entry) {

        if (/\/$/.test(entry.fileName)) {
          // directory file names end with '/'
          return;
        }

        var fileName = entry.fileName;
        fileName = fileName.split(path.sep);
        fileName = fileName.splice(1, fileName.length)
        fileName = fileName.join(path.sep);

        entry.fileName = fileName;
        var dest = path.join(extractTo, entry.fileName)
        var destDir = path.dirname(dest)
          // dest = dest.split(path.sep);
          // dest = dest.slice(0, dest.length - 1);

        zipfile.openReadStream(entry, function (err, readStream) {
          if (err) {
            send(err);
            return;
          }

          mkdirp(destDir, function (err) {
            if (err) {
              send(err);
            }


            //entry.fileName = data.url.replace("/", "-");
            // ensure parent directory exists, and then:

            readStream.pipe(fs.createWriteStream(dest).on("error", function (err) {
              send(err)
            }))
          });

        });

      });
    });

  } catch (e) {
    send(e);
  }
}