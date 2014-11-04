$(document).ready(function () {

  $(".loader span").css("animationIterationCount", "1");
  window.setTimeout(function () {
    $(".loader").fadeOut();
  }, 3000)

});