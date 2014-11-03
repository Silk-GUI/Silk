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
      if(position > -1){
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
      app.running = true;
      
    app.minimized = !app.minimized;
      if (app.minimized === false) {
        windowOrder.unshift(app.title);
      }
     if(app.minimized === true){
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