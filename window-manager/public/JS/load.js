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