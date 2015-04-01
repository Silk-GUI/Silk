/**
* Creates a new window
* @constructor
* @param {object} json - json fron app.json
* @param {array} windows - array of windows
* @param {array} order - array for order of windows
*/
var Win = function(json, windows, order){
  if(typeof json !== "object"){
    throw new Error('Win constructor needs a json object');
  }
  // throw error if multiple windows is false and there already is a window
  if(json.multipleWindows === false){
    for(var i = 0; i < windows.length; ++i){
      if(windows[i] && windows[i].name === json.name){
        throw new Error('multipleWindows: false and there already is a window');
      }
    }
  }
  /**
  * Order of windows
  * @type {array}
  */
  this._order = order;
  this.json = json;
  this.name = json.name;
  this.url = json.url;
  this.icon = json.icon;
  this.title = json.title;
  this.running = false;
  this.minimized = true;
  this.active = false;
  // position
  this.x = 0;
  this.y = 0;
  this.z = 0;
  // in percentages
  this.width = 100;
  this.height = 100;
  
}

Win.prototype.open = function(){
  this.minimized = false;
  this._order.unshift(this.index);
  updateOrder();
}
Win.prototype.start = function () {
  windows.push(this);
  this.index = windows.length - 1;
  this.running = true;
}
Win.prototype.minimize = function () {
  this.minimized = true;
  var position = this._order.indexOf(this.index);
  this._order.splice(position, 1);
  updateOrder();
}
Win.prototype.close = function () {
  this.minimized = true;
  this.running = false;
  var position = this._order.indexOf(this.index);
  this._order.splice(position, 1);
  var placeholder = {
    minimized: true,
    running: false
  };
  windows[this.index] = placeholder;
  updateOrder();
}