var file = {};
Silk.event("openFile", function(path){
  
if (path == null) {
   $("#notifications").html("Please open a file using File Explorer");
  file.path == null;
} else {
  alert(path);
  file.path = path;
  methods.listen("te/open", file.path, function (error, data) {
    if (error) {
      alert(error);
    }
  //  alert(data.state);
    if(data.state = "loading"){
     $("#notifications").html("Loading");
    }
    if(data.content != undefined){
      $("#text").val(data.content);
      $("#notifications").html(file.path);
    }
    
  });
}
});

$("#save").click(function(){
  if(file.path != null){
    alert($("#text").val());
    methods.call("te/save", {path: file.path, contents: $("#text").val()});
  }
})