var defaults = {};

// load defaults from file
function loadDefaults() {
  var fs = require("fs");
  var fileName = __root + "/core/settings/app-defaults.json"

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

          if (info[item].defaults != "") {
            if (item in defaults) {
              defaults[item].defaults = info[item].default;
            } else {
              defaults[item] = {};
              defaults[item] = {
                default: info[item].default,
                available: []
              };
            }
          }
        }

      })
    });
  });
}

// saves defaults in file
function saveDefaults() {
  var fs = require("fs"),
    path = __root + "/core/settings/app-defaults.json",
    contents = {},
    item;
  for (item in defaults) {

    // TODO only save items that have a default
    console.log("contents: " + item);
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

module.exports = function (windows, Silk) {

  defaults = Silk.defaults;
  loadDefaults();

  for (var i = 0; i < windows.length; ++i) {

    if ("opens" in windows[i]) {

      var opens = windows[i].opens;

      console.log("43 " + windows[i].title);

      //for each mime listed in windows
      for (var x = 0; x < opens.length; ++x) {

        if (opens[x] in Silk.defaults) {
          console.log(opens[x] + " exists in Silk.defaults");
          Silk.defaults[opens[x]].available.push(windows[i]);

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
  }


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