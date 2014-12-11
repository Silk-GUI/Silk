if(module.exports){
  var jspath = require("jspath");
}

function PathWrapper(path,subs,ctx){
  if(arguments.callee.caller.name != "PathWrapper"){
    return new PathWrapper(path,subs,ctx);
  }
  if(typeof ctx == "undefined"){
    ctx = subs;
    subs = void(0);
  }
  this.ctx = ctx;
  return this.prep(path,subs);
}

PathWrapper.prototype.prep = function(path,subs){
  if(!/undefined|object/.test(typeof subs))
    throw new Error("No Substitution is better than a non-Object Substitution")
  if(typeof path !== "string")
    throw new Error("If your path is not a string, there isn't a point to this")
  this.path = path;
  this.subs = subs;
  if(this.ctx)
    return this.apply(this.ctx);
  return this;
}

PathWrapper.prototype.apply = function(ctx){
  if(typeof ctx != "object")
    throw new Error("Cannot retrieve Values of a Non-Object");
  this.ctx = ctx;
  this.values = jspath(this.path,this.ctx,this.sctx)
  return this;
}

PathWrapper.prototype.delete = function(propertyname){
  if(typeof this.values == "undefined")
    throw new Error("Cannot delete what doesn't exist");
  for(var i in this.values)
    delete this.values[i][propertyname]
  return this;
}

PathWrapper.prototype.set = function(propertyname, value){
  if(typeof this.values == "undefined")
    throw new Error("Cannot delete what doesn't exist");
  for(var i in this.values)
    this.values[i][propertyname] = value
  return this;
}

PathWrapper.prototype.map = function(fn){
  this.values.forEach(fn);
  return this;
}


PathWrapper.prototype.get = function(){
  if(this.ctx == "undefined")
    throw new Error("Please .apply(JSONObject) before attempting to retrieve ")
  return this.values;
}

if(module.exports){
  module.exports = PathWrapper;
}
