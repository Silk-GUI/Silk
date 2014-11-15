$(document).ready(function () {
  $(".loader span").css("animationIterationCount", "1");
  $.ajax("/windows.json").done(function(data){
    initializeManager(data);
      window.setTimeout(function () {
    $(".loader").fadeOut();
    }, 500)
  })


});
