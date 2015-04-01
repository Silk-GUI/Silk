var methods = Silk.methods;
var defaults = {};

var djson = __dirname + "/settings/app-defaults.json";
var windows;


// load defaults from file
function loadDefaults() {
  var fs = require("fs");
  var fileName = djson;

  fs.exists(fileName, function (exists) {
    // TODO create file if it doesn't exist
    if (!exists) {
      fs.writeFileSync(djson, '{}')

    }

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

  for (var i = 0; i < windows.length; ++i) {
    if (!("opens" in windows[i])) continue;
    var opens = windows[i].opens;

    //for each mime listed in windows
    for (var x = 0; x < opens.length; ++x) {

      if (opens[x] in defaults) {

        // don't add duplicate apps
        if (defaults[opens[x]].available.indexOf(windows[i].title) < 0) {
          defaults[opens[x]].available.push(windows[i].title);
        }

      } else {

        // create object for defaults

        defaults[opens[x]] = {};
        defaults[opens[x]] = {
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
      if (mime in defaults) {
        return defaults[mime];
      } else {
        var ret = defaults["*"];
        ret.mime = "*";
        return ret
      }
    },
    "Silk/setDefault": function (data) {
      if (data.mime in defaults) {
        defaults[data.mime].default = data.app;
      } else {
        defaults[data.mime] = {};
        defaults[data.mime] = {
          default: data.app,
          available: []
        };
      }
      saveDefaults();
    }
  });
}

// get windows from Server API and initialize

Silk.api.call('apps/list', {}, function (err, windows) {
  if(err){
    console.log(err);
    console.log('unable to load app defaults');
    return;
  }
  initialize(windows);
});
