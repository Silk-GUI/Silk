var electron      = require('electron'),
    BrowserWindow = electron.BrowserWindow,
    app           = electron.app;

app.on('ready', function () {
  var window = new BrowserWindow({nodeIntegration: false});
  window.loadUrl('http://localhost:3000');
  window.setFullScreen(true);
});
