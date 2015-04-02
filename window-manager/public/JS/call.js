// connect to socket
var socket;

(function () {
  try {

    var host = "//0.0.0.0:3000/ws";
    
     // change host url if remote
    if(/localhost:3000/.test(location.host) | /0.0.0.0:3000/.test(location.host)){
      } else{
      host =  "//" + location.host + "/ws";
    }
    console.log(host);
    socket = new SockJS(host);

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
methods.listeners = {};

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
methods.listen = function (name, callback) {
  var args = Array.prototype.slice.call(arguments, 0);
  callback = args.pop();
  name = args.shift();

  //id to find callback when returned data is received
  var id = Date.now() + "-" + Math.random();

  var content = {
    id: id,
    name: name,
  };
  // save callback so we can call it when receiving the reply
  methods.listeners[id] = content;
  methods.listeners[id].callback = callback;
  var ret = {
    id:id,
    name: name,
    send:function(data){
      var clone = {};
      for(var i in content)
        clone[i] = content[i];
      clone.data = data;
      try {
        socket.send(JSON.stringify(clone));
      } catch (e) {
        //if there is an error queue it for later when socket connects
        methods.queue.push(JSON.stringify(clone));
      }
    }
  };
  for(var i=0;i<args.length;i++){
    ret.send(args[i]);
  }
  return ret;
}
methods.remove = function(id){
  delete methods.listeners[id];
}

// calls callback and deletes item from methods.sent
methods.receive = function (message) {
  message = JSON.parse(message.data);
  if (typeof methods.sent[message.id] != "undefined") {
    console.log("called");
    console.dir(message.error);
    methods.sent[message.id].callback(message.error, message.data);
    delete methods.sent[message.id];
  }else if(methods.listeners[message.id] != undefined) {
    console.log("listened");
    methods.listeners[message.id].callback(message.error, message.data);
  }
}