var windows = [];

// channel for each window
var channels = {};

function CreateChannel(app) {
  app.running = true;
  var windowName = app.title;
  // allow html to be updated
  console.log(windowName);
  chan = Channel.build({
    window: $("#desktop .window iframe[data-name='" + windowName + "']")[0].contentWindow,
    origin: "*",
    scope: "testScope",
    onReady: function () {
      console.log("channel is ready!");
      console.log("ready");

    }
  })

  chan.bind("openFile", function (context, params) {
    console.log("=============")
    console.log(context);
    console.log(params);

    // open text editor and include path in url
    // find text editor
    for (var i = 0; i < windows.length; ++i) {

      if (windows[i].title === "Text Editor") {
        if (windows[i].running == false) {
          var url = windows[i].url;
          url = url.split("?")[0];
          windows[i].url = url + "?file=" + encodeURIComponent(params.path);
          windows[i].running = true;
          windows[i].minimized = false;
          CreateChannel(windows[i].title);
          windowOrder.unshift(windows[i].title);
        } else {
          channels[windows[i].title].notify({
            method: "fileToOpen",
            params: {
              path: params.path,
              mime: params.mimie
            }
          });
          if (windows[i].minimized == true) {
            windows[i].minimized = false;
            windowOrder.unshift(windows[i].title);
          } else {
            windowOrder.pop(windows[i].title);
            windowOrder.unshift(windows[i].title);
          }
        }

        updateOrder();

        break;
      }
    }
  });

  channels[windowName] = chan;
}

// order of open windows.  Used to calculate z-index.
var windowOrder = [];

// update z-index of windows
var updateOrder = function () {
  for (var i = 0; i < windows.length; ++i) {
    console.log(windows[i].title)
    if (windows[i].running === true & windows[i].minimized !== true) {
      console.log(windows[i].title + "will be updated");
      var position = windowOrder.indexOf(windows[i].title);
      if (position > -1) {
        windows[i].zIndex = 200 - position;
      }
    }
  }
}

var wm;
var taskbar;

function initializeManager(_windows) {
  windows = _windows;
  wm = new Vue({
    el: '#desktop',
    data: {
      windows: windows
    },
    methods: {
      buildChannel: CreateChannel,
      minimize: function (app) {
        // put window on top
        app.minimized = !app.minimized;

      },
      close: function (app) {
        app.running = false;
        app.minimized = true;
        windowOrder.pop(app.title);
        updateOrder();
      }
    }
  });

  taskbar = new Vue({
    el: '#taskbar',
    data: {
      programs: windows
    },
    methods: {
      open: function (app) {
        app.running = true;
        // move to top if behind
        if (app.minimized == false) {
          if (windowOrder.indexOf(app.title) > 0) {
            // move to top
            windowOrder.pop(app.title);
            windowOrder.unshift(app.title);
            updateOrder();
            return
          }
        }
        app.minimized = !app.minimized;
        if (app.minimized === false) {
          windowOrder.unshift(app.title);
        }
        if (app.minimized === true) {
          windowOrder.pop(app.title);
        }
        updateOrder();
      }
    }
  })
}