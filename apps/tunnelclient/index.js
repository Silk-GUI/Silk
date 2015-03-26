console.log('starting tunnelclient');
try {
var Tunnel2Proxy = require(__dirname+"/Tunnel2Proxy_com.js");
var methods = Silk.methods;
var tunnel = new Tunnel2Proxy();
console.log('tunnelcient');
if(typeof ForkRouter == "undefined"){
  methods.add({
    "tunnelclient-auth":function(data,call_ob,next){
      tunnel.setServer(data.url,data.pass,next);
      console.log('tunnel client');
    }
  })
}else{
  methods.add("auth",function(data,call_ob,next){
    tunnel.setServer(data.url,data.pass,next);
  })
}
console.log('added method');
} catch(e){
	console.log('error in tunnelclient');
	console.dir(e);
}