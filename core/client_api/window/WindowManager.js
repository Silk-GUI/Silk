if(typeof module != "undefined" && module.exports){
  var EventEmitter = require("events").EventEmitter;
  var FrameContext = require(__dirname+"/FrameContext.js");
}
/**
  These are all the classes and globals available on the Client
  To do a mass load of the clientside api use &lt;script src="/api.js" &gt;&lt;/script&gt;
  This will load everything in one package except for RSVP and EventEmitter

  @namespace ClientSide
*/


/**
  Creates a new WindowManager to be able to open, close and load windows on a web
  client.
  @constructor
  @augments EventEmitter
  @memberof ClientSide
  @param {object} [configs] - application configurations that can be given from anywhere
*/
function WindowManager(configs){
  EventEmitter.call(this);
  this.configs = [];
  this.windows = {};
  if(configs)
    setTimeout(this.initialize.bind(this,configs),10);
}
WindowManager.prototype = Object.create(EventEmitter.prototype);
WindowManager.prototype.constructor = WindowManager;
WindowManager.prototype.on = EventEmitter.prototype.addListener;
WindowManager.prototype.off = EventEmitter.prototype.removeListener;

/**
  loads configs if they weren't initially
  @memberof WindowManager
  @param {object} configs - application configurations that can be given from anywhere
*/
WindowManager.prototype.load = function(configs){
  console.log("loading");
  configs.forEach(this.registerWindow.bind(this));
  console.log("done");
  this.emit("load");
  return this;
}

/**
  registers a configuration or a {@link FrameContext}
  @memberof WindowManager
  @param {object|FrameContext} configs - application configuration or framecontext that can be given from anywhere
*/
WindowManager.prototype.registerWindow = function(config){
  console.log("f");
  if(!(config instanceof FrameContext)){
    console.log("create");
    var win = new FrameContext(this, config);
    console.log("didit");
  }else if(config.id in this.windows){
    console.log("found");
     return
  }
  this.windows[config.id] = win;
  this.configs.push(config);
  this.emit("registered", win);
  return this;
}

/**
  Method to find an appropiate application to open a file. Is subjecy to change
  @memberof WindowManager
  @param {WindowAbstract} source - application that gave the order
  @param {object} file - file with information about it
*/
WindowManager.prototype.openFile = function(source,file){
  console.log("opening");
  var that = this;
  var windows = this.windows
  $.ajax("/filesniffer?file="+file.path).done(function(sniffed){
    console.log(sniffed);
    var candidates = {};
    var count = 0;
    windowloop:
    for (var i in windows){
      if(windows[i] == source){continue;}
      if(!("listeners" in windows[i].config)){
        console.log("this window has no listeners");
        continue;
      }
      if(!("openFile" in windows[i].config.listeners)){
        console.log("this window doesn't have an open file listener");
        continue;
      }

      for(var j in windows[i].config.listeners.openFile){
        if(!(j in sniffed)) continue;
        var reg = windows[i].config.listeners.openFile[j];
        reg = new RegExp(reg);
        if(!reg.test(sniffed[j])){
          console.log("fialed on "+j);
          continue windowloop;
        }
      }

      candidates[i] = windows[i];
      count++;
    }
    if(count == 0)
      return alert("Your file of "+JSON.stringify(sniffed)+" has no takers : /");
    that.emit("openFile",sniffed,candidates,source);
  }).fail(function(e){
    console.log(e);
  })
}
