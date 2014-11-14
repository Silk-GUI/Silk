var windows = [{
    title: "File Explorer",
    url: "http://0.0.0.0:3000/fileExplorer/index.html",
    running: false,
    minimized: true,
    icon: "fileExplorer/logo.png",
    zIndex: 0
  },
  {
    title: "Text Editor",
    url: "http://0.0.0.0:3000/textEditor/index.html",
    running: false,
    minimized: true,
    icon: "textEditor/logo.png",
    zIndex: 0
               }

              ];

// channel for each window
channels = {};

function CreateChannel(windowName) {

  // allow html to be updated
  window.setTimeout(function () {
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

  }, 10);
}

// order of open windows.  Used to calculate z-index.
var windowOrder = [];

var wm = new Vue({
  el: '#desktop',
  data: {
    windows: windows
  }
});

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
var taskbar = new Vue({
  el: '#taskbar',
  data: {
    programs: windows
  },
  methods: {
    open: function (app) {
      if (app.running === false) {
        // create new channel
        CreateChannel(app.title);
      }
      app.running = true;

      app.minimized = !app.minimized;
      if (app.minimized === false) {
        windowOrder.unshift(app.title);
      }
      if (app.minimized === true) {
        windowOrder.pop(app.title);
      }
      updateOrder();
    },
    minimize: function (app) {
      // put window on top
      app.minimized = !app.minimized;

    }
  }
})