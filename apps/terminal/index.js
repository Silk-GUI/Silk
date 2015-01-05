try {
  var tty = require("tty.js");
} catch (e) {
  console.log("Couldn't find tty.js");
  return;
}
var app = tty.createServer({
  shell: 'bash',
  port: 8000
});


app.listen();