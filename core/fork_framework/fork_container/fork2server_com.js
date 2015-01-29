/*
  Similar to meteor.methods
*/
var serverAPI = require('./server_api.js');

function MethodCall(message){
  this.id = message.id;
  this.ws = message.ws;
  this.name = message.name;
  this.data = message.data;
}

MethodCall.prototype.exec = function(){
  var that = this;
  try{
    var result = methods.list[this.name](this.data,this,function(e,result){
      if(e) return that.sendErr(e);
      if(result) return that.sendResult(result);
      console.log("no error, no result");
    });
  }catch(e){
    return this.sendErr(e)
  }
  if(typeof result != "undefined")
    this.sendResult(result);
}

MethodCall.prototype.sendErr = function (e){
  process.send({cmd:"send",message:{
    id: this.id,
    ws: this.ws.id,
    error: e.toString(),
    data: null
  }});
}
MethodCall.prototype.sendResult = function (result){
  process.send({cmd:"send",message:{
    id: this.id,
    ws: this.ws.id,
    error: null,
    data: result,
  }});
}


var methods = {};

// object of all methods
methods.list = {};
methods.users = {};


// function to add method to methods.list
methods.add = function (array) {

  for (var method in array) {
    methods.list[method] = array[method];
    process.send({cmd:"add",name:method});
  }

}

// execute method when called by client
methods.call = function(ws,message){
  try{
    var meth = new MethodCall(ws,message);
  }catch(e){
    return console.log("error: "+e+", message: "+ JSON.stringify(message));
  }
  meth.exec();
}
var User = require(__dirname+"/ws_puppet.js");
process.on("message",function(message){
  if(!(message.ws in methods.users))
    methods.users[message.ws] = new User(message.ws);
  message.ws  = methods.users[message.ws];
  /*
  Commands:
    disconnect: Head is closed
    server api: return value for silk api method
  */
  if(!("cmd" in message)){
    var meth = new MethodCall(message);
    return meth.exec();
  }
  switch(message.cmd){
    case "disconnect": message.ws.emit("close"); break;
    case "close": break; //expected to close, will close forcfully in 5 seconds
    case "sleep": break; //Head is removed from the window manager so updates are impossible
    case "minimize": break; //Head is not removed but updates to the head will not be seen
    case "server api": Silk.api.done(message);
  }
});

// make global because it will be used in most files.
global.Silk = {};
Silk.methods = methods;
Silk.api = serverAPI;
global.methods = methods;

process.nextTick(function(){
  require(process.env.start);
})

process.send({cmd:"ready"});
