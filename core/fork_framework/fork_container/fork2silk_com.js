// makes silk api available to fork
var requests = {};

var call = function(method, data, cb){
  console.log(method);
  console.log(data);
  console.log("wanted to call silk method");
  var id = new Date().getTime() + '-' + Math.random();
  
  requests[id] = {
    cb: cb
  }
  
   process.send({cmd:"silkMethod",message:{
     id: id,
     method: method,
     data: data
  }});
}
var done = function(message){
  console.log("received reply");
  var id = message.message.id;
  var error = message.message.error;
  var result = message.message.result;
  try{
    requests[id].cb(error, result);
  } catch(e){
    
  }
}
global.Silk = {};
Silk.call = call;
Silk.done = done;