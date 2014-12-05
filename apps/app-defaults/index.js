var defaults = {};

var djson = __dirname + "/settings/app-defaults.json";
var windows;
var Silk = {
  defaults: {}
};

methods.add({
  "windows": function (windows) {
    initialize(windows);
  }
});

// load defaults from file
function loadDefaults() {
  var fs = require("fs");
  var fileName = djson;

  fs.exists(fileName, function (exists) {
    // TODO create file if it doesn't exist
    if (!exists) return;

    fs.stat(fileName, function (err, stats) {
      if (err) return console.log(err);
      if (stats.isDirectory())
        return;
      fs.readFile(fileName, function (err, data) {
        if (err) return;

        var info = JSON.parse(data.toString("utf-8")),
          item;

        for (item in info) {
          if (info[item].default == "") continue;
          if (item in defaults) {
            defaults[item].default = info[item].default;
          } else {
            defaults[item] = {};
            defaults[item] = {
              default: info[item].default,
              available: []
            };
          }
        }
      })
    });
  });
}

// saves defaults in file
function saveDefaults() {
  var fs = require("fs"),
    path = djson,
    contents = {},
    item;
  for (item in defaults) {

    // TODO only save items that have a default
    contents[item] = {};
    contents[item].default = defaults[item].default;
    contents[item].available = [];
  }

  contents = JSON.stringify(contents);

  fs.writeFile(path, contents, function (err) {
    if (err) return console.log(err);
    console.log("saved: " + path);
  });

}

function initialize(windows) {

  defaults = Silk.defaults;

 
  for (var i = 0; i < windows.length; ++i) {
    if (!("opens" in windows[i])) continue;
    var opens = windows[i].opens;

    //for each mime listed in windows
    for (var x = 0; x < opens.length; ++x) {

      if (opens[x] in Silk.defaults) {

        // don't add duplicate apps
        if (Silk.defaults[opens[x]].available.indexOf(windows[i].title) < 0) {
          Silk.defaults[opens[x]].available.push(windows[i].title);
        }

      } else {
       
        // create object for defaults

        Silk.defaults[opens[x]] = {};
        Silk.defaults[opens[x]] = {
          default: "",
          available: [windows[i].title]
        };
      }
    }
  }

  loadDefaults();
 //console.log(JSON.stringify(defaults, null, 4));
  methods.add({
    "Silk/appDefaults": function (mime) {
      if (mime in Silk.defaults) {
        return Silk.defaults[mime];
      } else {
        var ret = Silk.defaults["*"];
        ret.mime = "*";
        return ret
      }
    },
    "Silk/setDefault": function (data) {
      if (data.mime in Silk.defaults) {
        Silk.defaults[data.mime].default = data.app;
      } else {
        Silk.defaults[data.mime] = {};
        Silk.defaults[data.mime] = {
          default: data.app,
          available: []
        };
      }
      saveDefaults();
    }
  });
}