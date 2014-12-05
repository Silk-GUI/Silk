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

    methods.call("Silk/appDefaults", params.mime, function (err, data) {
      function openWindow(title) {
        // find window index
        for (var i = 0; i < windows.length; ++i) {

          if (windows[i].title === title) {

            // start the app
            if (windows[i].running == false) {
              var url = windows[i].url;
              url = url.split("?")[0];
              windows[i].url = url + "?file=" + encodeURIComponent(params.path);
              windows[i].running = true;
              windows[i].minimized = false;
              windowOrder.unshift(windows[i].title);

            } else {

              channels[windows[i].title].notify({
                method: "fileToOpen",
                params: {
                  path: params.path,
                  mime: params.mime
                }
              });

              if (windows[i].minimized == true) {
                windows[i].minimized = false;
                windowOrder.unshift(windows[i].title);
              } else {
                // move position to top
                windowOrder.pop(windows[i].title);
                windowOrder.unshift(windows[i].title);
              }

            }

            updateOrder();

            break;
          }
        }
      }

      console.log(data);

      // open using default program
      if (data.default !== "") {
        openWindow(data.default);
      }
      // if one app use it if it is not for *.
      else if (data.available.length < 2 && data.mime != "*") {
        openWindow(data.available[0]);
      }
      // let user choose program
      else {
        var html = '<div class="title">Choose App To Open <br>';
        html += params.path;
        html += '</div> <div class="content"><ul>';
        for (var i = 0; i < data.available.length; ++i) {
          html += "<li>";
          html += data.available[i];
          html += "</li>";
        }
        html += '</ul> <lable><input type="checkbox" checked> Always Use This App </label><div><button>Cancel</button></div></div>'
        $("#appNotifications").append(html);
        $("#appNotifications").css("display", "block");

        // set up click hander
        $("#appNotifications .content button").click(function (e) {
          $("#appNotifications").css("display", "none");
          $("#appNotifications").html("");
        });
        $("#appNotifications .content li").click(function (e) {
          console.log($(e.target).html());
          openWindow($(e.target).html());
          // if chewckbox is checked, set up default app
          if ($('#appNotifications input').is(':checked') == true) {
            methods.call("Silk/setDefault", {
              mime: params.mime,
              app: $(e.target).html()
            }, function () {})
          }
          $("#appNotifications").css("display", "none");
          $("#appNotifications").html("");
        });
      }
    });

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
var menu;

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
        // reset url
        app.url = app.url.split("?")[0];
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
      apps: windows
    },
    methods: {
      open: function (app) {
        app.running = true;
        
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

        // open window and move to top
        if (app.minimized == false) {

          windowOrder.pop(app.title);
          windowOrder.unshift(app.title);
          updateOrder();

        } else {
          app.minimized = false;
          windowOrder.unshift(app.title);
          updateOrder();
        }
      }
    }
  })
}