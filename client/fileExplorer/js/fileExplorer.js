var path = "/";

function file_explorer(elem){
  if(typeof elem == "undefined")
    elem = "body";
  this.elem = jQuery(elem);
  this.files = this.elem.find(".files");
  this.cd = this.elem.find(".current_path");
  var that = this;
  jQuery(this.elem).on("click",".current_path a,.files .directory a", function(e){
    e.preventDefault();
    that.changeDirectory($(this).attr("href"))
    return false;
  })
  jQuery(this.elem).on("click",".files .file a", function(e){
    e.preventDefault();
    alert("You're going to have to setup a default view for mimetype: "+$(this).parent().attr("data-mime"));
    return false;
  })
  this.changeDirectory("/");
}

file_explorer.prototype.changeDirectory = function(href){
  // get files in / directory
  var that = this;
  methods.listen("fe/list/path", [href], function (err, list) {
    if(err) return alert(JSON.stringify(err));
    that.processList(href,list);
  });
}

file_explorer.prototype.processCD = function(href){
  aref = href.split("/");
  if(/\/$/.test(href)){
    aref.pop();
  }
  this.cd.empty();
  var netref = "";
  for(var i=0;i<aref.length;i++){
    var name = aref[i];
    if(name == ""){
      name = "root";
    }else
      netref += "/"+name
    this.cd.append("/<a href='"+netref+"'>"+name+"</a>");
  }
}
file_explorer.prototype.processList = function(href, list){
this.processCD(href);
this.files.empty();
for(var i=0;i<list.length;i++){
  var item = list[i];
  var el = jQuery("<li><a href='"+item.path+"'>"+item.name+"</a></li>");
  this.files.append(el);
  if(item.isDir){
    el.addClass("directory");
  }else{
    el.addClass("file");
    el.attr("data-mime", item.mime);
  }
}
}

jQuery(function($){
  new file_explorer();
})
