try {
  var tty = require("tty.js");
} catch (e) {
  console.log("Couldn't find tty.js");
  return;
}
var options = {
  "port": 8000,
  "shell": "bash"
};
var app = tty.createServer(options);


app.listen();