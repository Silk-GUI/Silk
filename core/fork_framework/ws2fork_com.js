/*
  Similar to meteor.methods
*/



var methods = {
  wflag:false,
  windows:[],
  requests:{},
  user_reqs:{},
  users:{},
  responders:{},
  fork_resp:{},
  forks:{}
};

methods.add = function(m,fork){
  debug("adding");
  this.responders[m.name] = fork;
  this.fork_resp[fork.pid].push(m.name)
}

methods.send = function(message){
  if(!this.requests[message.id]){
    debug("user removed or no request");
    return;
  }
  this.requests[message.id].send(JSON.stringify(message));
}

methods.removeFork = function(fork,code,signal){
  console.log(code+" "+signal);
  for(var i in this.forks[fork.pid]){
    delete this.reponders[this.forks[fork.pid][i]];
  }
  delete this.fork_resp[fork.pid];
  delete this.forks[fork.pid];
}

methods.addFork = function(fork){
  debug("adding fork");
  this.fork_resp[fork.pid] = [];
  this.forks[fork.pid] = fork;
  fork.on("message", function(message){
    switch(message.cmd){
      case "send": methods.send(message.message);break;
      case "add": methods.add(message,fork);break;
    }
  }.bind(this))
  fork.on("error",function(e){
    console.log(e);
  });
  fork.on("close",function(code,signal){
    methods.removeFork(fork,code,signal);
  })
}

methods.call = function(ws,message){
  try{
    message = JSON.parse(message);
  }catch(e){
    console.log("ERROR")
    console.log("err:"+e)
    console.log("mess: "+message)
    console.log("typeof: "+typeof message);
  }
  if(!(message.name in this.responders)){
    //console.log(JSON.stringify(message));
    return ws.send(JSON.stringify({
      id:message.id,
      ws:ws.id,
      error:"method "+message.name+" does not exist"
    }));
  }
  if(!this.users[ws.id]){
    this.users[ws.id] = ws;
    ws.on("close",function(){
      delete this.users[ws.id];
      for(var i in this.user_reqs[ws.id]){
        delete this.requests[this.user_reqs[ws.id][i]];
      }
      delete this.user_reqs[ws.id];
      for(var i in this.forks){
        this.forks[i].send({cmd:"disconnect",ws:ws.id});
      }
    }.bind(this))
    this.user_reqs[ws.id] = [];
  }
  message.ws = ws.id;
  this.user_reqs[ws.id].push(message.id);
  this.responders[message.name].send(message);
  this.requests[message.id] = ws;
}

// make global because it will be used in most files.
global.methods = methods;
