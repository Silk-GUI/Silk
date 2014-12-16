var file = {};
file.path = null;
file.changed = false;
$("#notifications").html("Please open a file using File Explorer");
Silk.event("openFile", function (path) {

  if (path == null) {
    $("#notifications").html("Please open a file using File Explorer");
    file.path == null;
  } else {
    if(file.changed === true){
      var fileName = path.split("/");
      fileName = fileName[fileName.length - 1];
      if(file.path != null){
      file.name = file.path.split("/");
      file.name = file.name[file.name.length - 1];
      }
      else{
        file.name = "Untitled"
      }
      var answer = confirm("Are you sure you want to open " + fileName + "\n \n You will lose your changes to " + file.name);
      if(answer === false){
        return false;
      }
    }
    file.path = path;
    methods.listen("te/open", file.path, function (error, data) {
      if (error) {
        alert(error);
      }

      if (data.state = "loading") {
        $("#notifications").html("Loading");
      }
      if (data.content != undefined) {
        $("#text").val(data.content);
        $("#notifications").html(file.path);
      }

    });
  }
});

$("#text").on("keydown", function(e){
  if(file.changed == false){
    $("#toolBar").css("borderBottomColor", "rgba(219, 179, 53, 1)");
  }
  file.changed = true;
})

$("#save").click(function () {
  if (file.path != null) {
    
    methods.call("te/save", {
      path: file.path,
      contents: $("#text").val()
    }, function (err, result) {
        $("#toolBar").css("borderBottomColor", " rgba(128, 128, 128, 0.8)");
     
    })
          file.changed = false;

  }
});

$(document).delegate('#text', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + "\t"
                + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});