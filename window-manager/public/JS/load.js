$(document).ready(function () {
  $(".loader span").css("animationIterationCount", "1");
  $.ajax("/windows.json").done(function (data) {
    
    // fix urls if remote
    if(remote.isRemote === true){
      console.log("fixing urls");
      for(var i = 0; i < data.length; ++i){
        data[i].url = remote.fixURL(data[i].url);
        data[i].icon = remote.fixURL(data[i].icon);
      }
      console.log(JSON.stringify(data));
    }
    
    initializeManager(data);
    window.setTimeout(function () {
      $(".loader").fadeOut();
    }, 80)
  })


});

// add nw class to body if in nw.js
(function () {
function isNW (evt) {
  var message;
  // nwjs message is from file://.  
  //alert(evt.data);
  if(evt.data === "from nw.js"){
    $("body").addClass('nwjs');
    //alert('is nwjs');
  }
}

if (window.addEventListener) {
  // For standards-compliant web browsers
  window.addEventListener("message", isNW, false);
}
else {
  window.attachEvent("onmessage", isNW);
}
})();