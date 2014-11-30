if(typeof module != "undefined" && module.exports){
  var MessageDuplex = require(__root+"/core/abstract/MessageDuplex.js");
}


/**
  Is a window that can be messaged to. Extends MessageDuplex so has everything there associated to it.
  It is based off window.postMessage
  @memberof ClientSide
  @constructor
  @augments MessageDuplex
  @param {window} [context] - the window it will be speaking to
  @param {string} [origin=*] - the origin namespace it will be restricted to.
*/
function WinAbs(context, origin){
  this.origin = (origin)?origin:"*";
  console.log("b4messdup");
  MessageDuplex.call(this, function(message){
    message.user = null;
    this.context.postMessage(JSON.stringify(message),this.origin);
  }.bind(this));
  var that = this;
  console.log("messdup");
  if(context)
    setTimeout(function(){
      that.open(context);
    },10);
  return this;
}

WinAbs.prototype = Object.create(MessageDuplex.prototype);
WinAbs.prototype.constructor = WinAbs;
/**
  If a context wasn't originally provided, you can provide it here
  @memberof WinAbs
  @param {window} context - the window it will be speaking to
*/
WinAbs.prototype.open = function(context){
  if(typeof context === "undefined")
     throw new Error("to construct "+arguments.callee.name+" You need to provide a window");
  this.context = context;
  var that = this;
  window.addEventListener("message",function(message){
    if(message.source != that.context){
      return;
    }
    message = JSON.parse(message.data);
    setTimeout(function(){
      that.handleMessage(message,that.context);
    },10);
  });
  this.ready();
}


/**
  If this window has a parent, then we guess the parent is a manager. This is provided globally
  @memberof ClientSide
  @var {WinAbs} Manager
*/
/**
  If this window is not top, there is definitely a manager there. This is provided globally
  @memberof ClientSide
  @var {WinAbs} RootManager
*/

if(window.parent && window.parent != window){
  window.Manager = new WinAbs(window.parent);
  if(window.top != window.parent)
    window.RootManager = new WinAbs(window.top);
}
