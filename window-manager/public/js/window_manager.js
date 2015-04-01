var apps = [],
  windows = [],
  windowOrder = [],
  wm,
  taskbar,
  menu;

// returns app json for app name 
var appFromName = function (name) {
  for(var i = 0; i < apps.length; ++i) {
    if(apps[i].name === name){
      return apps[i];
    }
  }
};

// update z-index of windows
var updateOrder = function () {
  for (var i = 0; i < windows.length; ++i) {
    // skip this window if it was closed
    if(typeof windows[i] === "undefined"){
      continue;
    }
    if (windows[i].running === true & windows[i].minimized !== true) {
      console.log(windows[i].title + "will be updated");
      var position = windowOrder.indexOf(i);
      if (position > -1) {
        windows[i].z = 200 - position;
      }
    }
  }
};

function initializeManager(appList) {
  apps = appList;

  wm = new Vue({
    el: '#desktop',
    data: {
      windows: windows
    },
    methods: {
      buildChannel: CreateChannel,
      minimize: function (index) {
        windows[index].minimize();
      },
      close: function (index) {
        windows[index].close();
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
        if (app.running === false) {
          app.start();
          return app.open();
        } else if (app.minimized === true) {
          return app.open();
        } else if (windowOrder.indexOf(app.index) > 0) {
          // app is open but not on top
          var position = windowOrder.indexOf(app.index);
          windowOrder.splice(position, 1);
          windowOrder.unshift(app.index);
          updateOrder();
          return;
        } else if (windowOrder.indexOf(app.index) === 0) {
          app.minimize();
        }


      },
      menu: function () {
        // toggle menu
        if ($("#menu").css("display") == "block") {
          $("#menu").css("overflow", "hidden");
          $("#menu").animate({
              height: 0,
              opacity: 0
            },
            100, 'swing',
            function () {
              $("#menu").css({
                "display": "none",
                "height": "auto"
              });
            });

        } else {
          var height = $("#menu").height();

          // $("#taskbar").css("bottom", height);
          $("#menu").css("display", "block");
          $("#menu").css("height", 0);
          $("#menu").css("overflow", "hidden");
          $("#menu").animate({
            height: height,
            overflow: "scroll",
            opacity: 1
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
        // todo correctly handle apps with muitpleWindows: false
        try {
          var win = new Win(apps[index], windows, windowOrder);
        } catch (e) {
          // check if window is already open
          for (var i = 0; i < windows.length; ++i) {
            if (windows[i].name === apps[index].name) {
              var win = windows[i];
              break;
            }
          }
        }
        win.start();
        win.open();
        // hide menu
        $("#menu").css("overflow", "hidden");
        $("#menu").animate({
            height: 0,
            opacity: 0
          },
          100, 'swing',
          function () {
            $("#menu").css({
              "display": "none",
              "height": "auto"
            })
          });
      }
    }
  });
  $("#menu h1 img").click(function () {
    $("#menu").css("overflow", "hidden");
    $("#menu").animate({
        height: 0,
        opacity: 0
      },
      100, 'swing',
      function () {
        $("#menu").css({
          "display": "none",
          "height": "auto"
        })
      });
  })
}