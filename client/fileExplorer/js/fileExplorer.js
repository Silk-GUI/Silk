var path = "/";
var files = [];
var folders = [];

function seperateFiles(list){
  for(var i = 0; i < list.length; ++i){
    var item = list[i];
    var index = item.indexOf(".");
    if(index == -1){
      folders.push(item);
      
    }
    else{
      files.push(item);
    }
    console.log(files);
    console.log(folders);
  }
}

// get files in / directory
methods.call("fe/list/home", {}, function (err, list) {
 seperateFiles(list);
  document.write(list);
});