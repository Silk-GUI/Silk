var WL = require(__dirname+'/app_loader.js')
var windows;

require(__dirname+"/ws2fork_com.js");


module.exports = function(app,wss){
  windows = new WL(__root+"/apps/","/",app);
  windows.on("finishedCompiling", function(results){
    for(var i in windows.hashmap)
      windows.hashmap[i].fork.send({name:"windows",data:windows.clean});
    console.log("\nThese Windows were completed: "+ JSON.stringify(results));
  });
  windows.on("forked", function(fork){

    methods.addFork(fork);
    fork.on("error",function(err){
      console.log(err);
    });
    fork.on("close",function(code,signal){
      console.log("child is closed");
    });
    fork.on("disconnect",function(){
      console.log("child disconnected")
    })
  })
/*

  methods.add({
    "silk/apps/list": function (data) {
      console.log("test");
      console.log("received: " + data);
      return "this is a vlue returned by the method"
    }
  });
*/
  app.get("/windows.json",function(req,res,next){
    console.log(windows.clean);
    res.type("json").send(windows.clean);
  });

  return windows.clean;
}
