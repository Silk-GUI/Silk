// makes silk api available to fork
var requests = {};

var call = function(method, data, cb){
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
  var id = message.message.id;
  var error = message.message.error;
  var result = message.message.result;
  try{
    requests[id].cb(error, result);
  } catch(e){
    
  }
}

var api = {};
api.call = call;
api.done = done;

module.exports = api;