// connect to socket
var socket;

(function () {
  try {

    var host = "ws://0.0.0.0:9999";
    
    // change host url if remote
    if(/localhost:3000/.test(location.host) | /0.0.0.0:3000/.test(location.host)){{
      host = location.protocol + "//" + location.host + ":9999";
    }
    socket = new WebSocket(host);

    socket.onopen = function () {

      console.log("connected to socket");
      if (methods.queue.length > 0) {
        for (var i = 0; i < methods.queue.length; ++i) {
          if (methods.queue.hasOwnProperty(i)) {

            socket.send(methods.queue[i]);
            console.log(methods.queue[i]);
          }
        }
        methods.queue = [];
      }
    }

    socket.onmessage = function (msg) {
      methods.receive(msg);
    }

    socket.onclose = function () {
      console.log('Socket Status: ' + socket.readyState + ' (Closed)');
    }

  } catch (exception) {
    console.log('Error' + exception);
  }
})()

var methods = {};
// method calls that are before the socket connects
methods.queue = [];
// method calls that are sent and waiting an answer
methods.sent = {};

// function to call server method
methods.call = function (name, data, callback) {

  //id to find callback when returned data is received
  var id = Date.now() + "-" + Math.random();

  var content = {
    id: id,
    name: name,
    data: data
  };
  // save callback so we can call it when receiving the reply
  methods.sent[id] = content;
  methods.sent[id].callback = callback;
  try {
    socket.send(JSON.stringify(content));
  } catch (e) {
    //if there is an error queue it for later when socket connects
    methods.queue.push(JSON.stringify(content));
  }
}
// calls callback and deletes item from methods.sent
methods.receive = function (message) {

  message = JSON.parse(message.data);
  if (methods.sent[message.id] != undefined) {
    methods.sent[message.id].callback(message.error, message.data);
    delete methods.sent[message.id];
  }
}

// test
methods.call("silk/apps/list", {
  name: "test"
}, function (error, data) {
  console.log("This is inside the callback");
  console.log(error);
  console.log(data);
});