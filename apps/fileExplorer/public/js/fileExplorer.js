var path = "/";

function file_explorer(elem) {
  if (typeof elem == "undefined")
    elem = "body";
  this.elem = jQuery(elem);
  this.files = this.elem.find(".files");
  this.cd = this.elem.find(".current_path");
  this.href = "";
  var that = this;
  jQuery(this.elem).on("click", ".current_path a,.files .directory a", function (e) {
    e.preventDefault();
    that.changeDirectory($(this).attr("href"))
    return false;
  })
  // open file when clicked
  jQuery(this.elem).on("click", ".files .file a", function (e) {
    e.preventDefault();

    Silk.openFile($(this).attr("href"), $(this).parent().attr("data-mime"));
    // alert("You're going to have to setup a default view for mimetype: " + $(this).parent().attr("data-mime"));
    return false;
  })
  // Create folder
  jQuery("#newFolder").click(function (e) {
    var name = prompt("Name of Folder");
    methods.listen("fe/create/folder", {path: that.href, name: name}, function (err, result) {
      if(err){
      alert(err);
      return;
    }
    })
  })
  this.listener = methods.listen("fe/list/path", function (err, list) {
    if (err) return alert(JSON.stringify(err));
    that.processList(that.href, list);
  });

  this.changeDirectory("/");
}

file_explorer.prototype.changeDirectory = function (href) {
  // get files in / directory
  console.log("sending href: " + href);
  this.href = href;
  this.listener.send(href)
}

file_explorer.prototype.processCD = function (href) {
  aref = href.split("/");
  if (/\/$/.test(href)) {
    aref.pop();
  }
  this.cd.empty();
  var netref = "";
  for (var i = 0; i < aref.length; i++) {
    var name = aref[i];
    if (name == "") {
      name = "root";
    } else
      netref += "/" + name
    this.cd.append("<i class='fa fa-caret-right'></i><span>/</span><a href='" + netref + "'>" + name + "</a>");
  }
}
file_explorer.prototype.processList = function (href, list) {
  var files = [];
  this.processCD(href);
  this.files.empty();

  // add folders and separate files
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item.isDir) {
      var el = jQuery("<li><a href='" + item.path + "'><i class='fa fa-folder'></i>" + item.name + "</a></li>");
      this.files.append(el);
      el.addClass("directory");

    } else {
      files.push(item);
    }
  }

  // add files
  for (var i = 0; i < files.length; i++) {
    var item = list[i];
    var el = jQuery("<li><a href='" + item.path + "'><i class='fa fa-file-o'></i>" + item.name + "</a></li>");
    this.files.append(el);
    el.addClass("file");
    el.attr("data-mime", item.mime);

  }

}



jQuery(function ($) {
  new file_explorer();
})