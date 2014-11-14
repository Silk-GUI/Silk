var file = {};
Silk.event("openFile", function(path){
  
if (path == null) {
   $("#notifications").html("Please open a file using File Explorer");
  file.path == null;
} else {
  
  file.path = path;
  methods.listen("te/open", file.path, function (error, data) {
    if (error) {
      alert(error);
    }
  
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
   
    methods.call("te/save", {path: file.path, contents: $("#text").val()});
  }
})