/*
  Similar to meteor.methods
*/

var methods = {};

// object of all methods
methods.list = {};

// function to add method to methods.list
methods.add = function (array) {
  
  for (var method in array) {
    methods.list[method] = array[method];
  }
  
}

// execute method when called by client
methods.call = function (id, name, data) {
  var error = null,
    returnValue = null;
  try {
    returnValue = methods.list[name](data);
  } catch (e) {
    error = e;
  }
  return {
    id: id,
    error: null,
    data: returnValue,
  }
}

// make global because it will be used in most files.
global.methods = methods;