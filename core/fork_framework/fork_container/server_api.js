// makes silk api available to fork
var requests = {};

var call = function (method, data, cb) {
  var id = new Date().getTime() + '-' + Math.random();

  requests[id] = {
    cb: cb,
    type: 'call'
  };

  process.send({
    cmd: "server api",
    message: {
      id: id,
      method: method,
      data: data,
      type: 'call'
    }
  });
};
var listen = function (method, data, cb) {
  var id = new Date().getTime() + '-' + Math.random();

  requests[id] = {
    cb: cb,
    type: 'listener'
  };

  process.send({
    cmd: 'server api',
    message: {
      id: id,
      method: method,
      data: data,
      type: 'listener'
    }
  });
  
};
var removeListener = function (id) {
  var request = requests[id];
  if(request.type === 'call'){
    return;
  }
  delete requests[id];
  // TODO tell api it can stop sending changes
};

var done = function (message) {
  var id = message.message.id;
  var error = message.message.error;
  var result = message.message.result;
  try {
    requests[id].cb(error, result);
  } catch (e) {

  }
  if (requests[id].type === 'call') {
    delete requests[id];
  }
};

var api = {};
api.call = call;
api.listen = listen;
api.done = done;

module.exports = api;