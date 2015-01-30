
var util = require("util");
var events = require("events");

function User(id){
  this.id = id;
}
util.inherits(User,events.EventEmitter);

//This method is to deliver cute notifications without the use feeling overwhelmed
//Generally used when head is sleeping

module.exports = User;
