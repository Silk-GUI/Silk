var remote = {};

(function () {
  
  // check if url is remote
  if(/localhost:3000/.test(location.host) | /0.0.0.0:3000/.test(location.host)){
    // not remote  
  } else{
    remote.isRemote = true;
  }
  
  // change http://localhost or 0.0.0.0 to remote address
  remote.fixURL = function(url){
    if(remote.isRemote === false){
      return url;
    }
    var http = /^http:/i;
    var https = /^https:/i;
    
    if(/localhost:3000/.test(url) | /0.0.0.0:3000/.test(url)){
     url = location.protocol + "//" + url.replace("http://localhost:3000", location.host);
      return url;
    }
  }
  
})()