// channel for each window
var channels = {};

function CreateChannel(index) {
  var app = windows[index];
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
      if(err){
        alert(err);
        return;
      }
      function openWindow(title) {
        // get app's json
        var app = appFromName(title);
        // clone app to not change origional url
        app = JSON.parse(JSON.stringify(app));
        app.url = app.url + '?file=' + encodeURIComponent(params.path);
        try {
          var win = new Win(app, windows, windowOrder);
          win.start();
          win.open();
        } catch (e) {
          alert('error opening file');
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