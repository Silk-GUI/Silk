var Tunnel2Proxy = require(__dirname+"/Tunnel2Proxy_com.js");

var tunnel = new Tunnel2Proxy();

if(typeof ForkRouter == "undefined"){
  methods.add({
    "tunnelclient-auth":function(data,call_ob,next){
      tunnel.setServer(data.url,data.pass,next);
    }
  })
}else{
  methods.add("auth",function(data,call_ob,next){
    tunnel.setServer(data.url,data.pass,next);
  })
}
