/*
  Similar to meteor.methods
*/

function MethodCall(ws,message){
  try{
  message = JSON.parse(message);
}catch(e){
  console.log("ERROR")
  console.log("err:"+e)
  console.log("mess: "+message)
  console.log("typeof: "+typeof message);
}
  this.id = message.id;
  this.ws = ws;
  this.name = message.name;
  this.data = message.data;
}

MethodCall.prototype.exec = function(){
  var that = this;
  try{
    var result = methods.list[this.name](this.data,this,function(e,result){
      if(e) return that.sendErr(e);
      if(result) return that.sendResult(result);
    });
  }catch(e){
    return this.sendErr(e)
  }
  if(result != "undefined")
    this.sendResult(result);
}

MethodCall.prototype.sendErr = function (e){
  this.ws.send(JSON.stringify({
    id: this.id,
    error: e,
    data: null,
  }));
}
MethodCall.prototype.sendResult = function (result){
  this.ws.send(JSON.stringify({
    id: this.id,
    error: null,
    data: result,
  }));
}


var methods = {};

// object of all methods
methods.list = {};

// function to add method to methods.list
methods.add = function (array) {

  for (var method in array) {
    methods.list[method] = array[method];
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

// make global because it will be used in most files.
global.methods = methods;
