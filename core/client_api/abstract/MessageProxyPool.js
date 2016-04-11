

function MessageProxyPool(slaveSend) {
  this.slaves = {}; // slaves can have multiple clients at a time
  this.slaveSend = slaveSend;
}

MessageProxyPool.prototype.slaveEnter = function (slave) {
  slave.id = Date.now() + "|" + Math.random();
  slave.messages = [];
  this.slaves[slave.id] = slave;
  this.slaveSend({ name:'id', type:'trigger', message:slave.id }, slave);
};

MessageProxyPool.prototype.slaveLeave = function (slave) {
  delete this.slaves[slave.id];
  slave = null;
};

MessageProxyPool.prototype.slaveMessage = function (message, slave) {
  if (!this.slaves[message.target]) {
    message.data = null;
    message.error = 'User does not exist';
    this.slaveSend(message, slave);
  }
  this.slaveSend(message, this.slaves[message.target]);
};
