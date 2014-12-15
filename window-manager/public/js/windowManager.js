var windows = [];
var apps = [];

// order of open windows.  Used to calculate z-index.
var windowOrder = [];

// update z-index of windows
var updateOrder = function () {
  for (var i = 0; i < windows.length; ++i) {
    console.log(windows[i].title)
    if (windows[i].running === true & windows[i].minimized !== true) {
      console.log(windows[i].title + "will be updated");
      var position = windowOrder.indexOf(i);
      if (position > -1) {
        windows[i].zIndex = 200 - position;
      }
    }
  }
}

var wm;
var taskbar;
var menu;

function initializeManager(_windows) {
  apps = _windows;
  wm = new Vue({
    el: '#desktop',
    data: {
      windows: windows
    },
    methods: {
      buildChannel: CreateChannel,
      minimize: function (index) {
        windows[index].minimized = true;
        windowOrder.pop(index);
      },
      close: function (index) {
        // reset url
        var app = windows[index];
        app.url = app.url.split("?")[0];
        app.running = false;
        app.minimized = true;
        windowOrder.pop(index);
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
      open: function (index) {
        app = windows[index];
        app.running = true;
        
        // move to top if behind
        if (app.minimized == false) {
          if (windowOrder.indexOf(index) > 0) {
            // move to top
            windowOrder.pop(index);
            windowOrder.unshift(index);
            updateOrder();
            return
          }
        }
        
        app.minimized = !app.minimized;
        if (app.minimized === false) {
          windowOrder.unshift(index);
        }
        if (app.minimized === true) {
          windowOrder.pop(index);
        }
        updateOrder();
      },
      menu: function () {
        // toggle menu
        if ($("#menu").css("display") == "block") {
          $("#menu").css("overflow", "hidden");
          $("#menu").animate({
              height: 0,
            },
            100, 'swing', function () {
              $("#menu").css({
                "display": "none",
                "height": "auto"
              })
            });
          $("#taskbar").animate({
            bottom: 0
          }, {
            duration: 100
          });


        } else {
          var height = $("#menu").height();

          // $("#taskbar").css("bottom", height);
          $("#menu").css("display", "block");
          $("#menu").css("height", 0);
          $("#menu").css("overflow", "hidden");
          $("#menu").animate({
            height: height,
            overflow: "scroll"
          }, {
            duration: 100
          });
          $("#taskbar").animate({
            bottom: height
          }, {
            duration: 100
          });
        }
      }
    }
  });

  menu = new Vue({
    el: '#menu',
    data: {
      apps: apps
    },
    methods: {
      open: function (index) {

        // hide menu
        $("#menu").css("overflow", "hidden");
        $("#menu").animate({
            height: 0,
          },
          100, 'swing', function () {
            $("#menu").css({
              "display": "none",
              "height": "auto"
            })
          });

        $("#taskbar").animate({
          bottom: 0
        }, {
          duration: 100
        });

        var app = menu.$data.apps[index];

        // create new window
        if (app.multipleWindows === true) {
          // clone object
          var win = JSON.parse(JSON.stringify(app));
          win.running = true;
          win.minimized = false;
          windows.push(win);
          windowOrder.unshift(index);
          updateOrder();

        } else {
          var win = JSPath.apply('.windows{.title == "' + app.title + '"}', wm.$data);
          if ( win.length > 0) {
            app = win[0];
          } else{
            app = windows.push(app);
            app = windows[app - 1];
          }

          // open existing window and move to top
          if (app.minimized == false) {
            // check if window open

            windowOrder.pop(index);
            windowOrder.unshift(index);
            updateOrder();

          } else {
            app.minimized = false;
            app.running = true;
            windowOrder.unshift(index);
            updateOrder();
          }
        }
      }
    }
  })
}