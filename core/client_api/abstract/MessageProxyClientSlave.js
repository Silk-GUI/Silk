

function MessageProxy(clientSend, slaveSend) {
  this.slaves = {}; // slaves can have multiple clients at a time
  this.clients = {}; // clients can only have one slave at a time
  this.clientSend = clientSend;
  this.slaveSend = slaveSend;
}

MessageProxy.prototype.clientEnter = function (client) {
  client.id = Date.now() + "|" + Math.random();
  client.slave = void(0);
  this.clients[client.id] = { id:client.id, slave:client.slave, res:client, sq:[] };
};

MessageProxy.prototype.bindClient = function (slave, client) {
  if (!this.slaves[slave.id]) {
    throw new Error('nonexistant skave');
  }
  this.clients[client.id].slave = this.slaves[slave.id];
  this.slaves[slave.id].clients.push(client.id);
};

MessageProxy.prototype.clientLeave = function (client) {
  client.slave.clients.splice(client.slave.clients.indexOf(client), 1);
  delete this.clients[client.id];
  client = null;
};

MessageProxy.prototype.clientMessage = function (message, client) {
  if (message.name == 'bind') {
    return this.bindClient(message, client);
  }
  if (!this.clients[client.id].slave) {
    message.data = null;
    message.error = 'User has no local';
    return this.clientSend(message, client);
  }
  message.client = client.id;
  this.slaveSend(message, this.clients[client.id].slave);
};

MessageProxy.prototype.slaveEnter = function (slave) {
  slave.id = Date.now() + "|" + Math.random();
  slave.clients = [];
  this.slaves[slave.id] = slave;
  this.slaveSend({ name:'id', type:'trigger', data:slave.id }, slave);
};

MessageProxy.prototype.slaveLeave = function (slave) {
  var that = this;
  slave.clients.forEach(function (clientid) {
    delete that.clients[clientid].slave;
  });
  delete this.slaves[slave.id];
  slave = null;
};

MessageProxy.prototype.slaveMessage = function (message, slave) {
  if (!this.clients[message.client]) {
    message.data = null;
    message.error = 'User does not exist';
    this.slaveSend(message, slave);
  }
  if (slave.clients.indexOf(message.client) == -1) {
    message.data = null;
    message.error = 'This local is not subscribed to this user';
    this.slaveSend(message, slave);
  }
  this.clientSend(message, this.clients[message.client]);
};

if (typeof module != 'undefined' && module.exports) {
  module.exports = MessageProxy;
}
