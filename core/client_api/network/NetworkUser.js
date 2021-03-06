/* global MessageDuplex RTCPeerConnection */

/**
 A WebRTC connection between you and another party. Extends message duplex allowing
 you to add and send get, trigger and pipe requests to the other party. This is an
 implementation of {@linkcode https://developer.mozilla.org/en-US/docs/Web/Guide/API/WebRTC}

 @memberof ClientSide
 @constructor
 @augments MessageDuplex
 @param {NetworkHost} nethost - the network that initiated your connection
 @param {string} identity - your identity
 */
function NetworkInstance(nethost, target) {
  MessageDuplex.call(this, function (message) {
    message.identity = this.target;
    this.channel.send(JSON.stringify(message));
  }.bind(this));
  this.target = target;
  this.nethost = nethost;
  this.pconn = new RTCPeerConnection(nethost.config, {
    optional: [
      { DtlsSrtpKeyAgreement: true },
      { RtpDataChannels: true }
    ]
  });
  this.pconn.onicecandidate = this.iceCB.bind(this);
  Object.defineProperty(this, 'state', {
    get: function () {
      if (!this.pconn.localDescription) {
        return 'dormant';
      }
    },
    set: function () {
      throw new Error('cannot set the state');
    }
  });
}
NetworkInstance.prototype = Object.create(MessageDuplex.prototype);
NetworkInstance.prototype.constructor = NetworkInstance;
/**
 `netCallback` is a callback for when a {@link NetworkInstance} is done with work

 @callback netCallback
 @param {error} error - an error if one exists
 @param {object} this - itself
 */

/**
 Sends a webrtc offer to another party
 @memberof NetwokInstance
 @param {string} identity - the identity of the other party
 @param {netCallback} cb
 */
NetworkInstance.prototype.offer = function (identity, cb) {
  var self = this;

  this.target = identity;
  this.registerChannel(this.pconn.createDataChannel('sendDataChannel', this.nethost.sconfig));
  this.pconn.createOffer(function (desc) {
    self.pconn.setLocalDescription(desc, function () {
      self.nethost.RTCHandle.send({
        cmd: 'offer',
        identity: identity,
        desc: self.pconn.localDescription
      });
      cb(void(0), self);
    }, cb);
  }, cb);
};

NetworkInstance.prototype.registerChannel = function (channel) {
  var self = this;
  var message;
  this.channel = channel;
  this.channel.onmessage = function (event) {
    console.log(event);
    try {
      message = JSON.parse(event.data);
    } catch (e) {
      console.error(e);
      event.target.close();
      return;
    }
    self.handleMessage(message, event.target);
  };
  this.channel.onopen = function () {
    self.ready();
    self.nethost.emit('ready', self);
  };
  this.channel.onclose = this.emit.bind(this, 'close');
};
/**
 Accepts a webrtc offer from another party
 @memberof NetwokInstance
 @param {object} message - the original message from the other party
 @param {netCallback} cb
 */
NetworkInstance.prototype.accept = function (message, cb) {
  var self = this;
  this.pconn.ondatachannel = function (event) {
    self.registerChannel(event.channel);
  };
  this.pconn.setRemoteDescription(new RTCSessionDescription(message.desc), function () {
    self.pconn.createAnswer(function (desc) {
      self.pconn.setLocalDescription(desc, function () {
        self.nethost.RTCHandle.send({
          cmd: 'accept',
          identity: message.identity,
          desc: self.pconn.localDescription
        });
        cb(void(0), self);
      }, cb);
    }, cb);
  }, cb);
};

/**
 Solidifies a webrtc connection after the other party accepts
 @memberof NetwokInstance
 @param {object} message - the original message from the other party
 */
NetworkInstance.prototype.ok = function (message) {
  this.pconn.setRemoteDescription(new RTCSessionDescription(message.desc));
};

NetworkInstance.prototype.remoteIce = function (message) {
  this.pconn.addIceCandidate(new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate: message.candidate
  }));
};

NetworkInstance.prototype.iceCB = function (event) {
  if (!event.candidate) {
    return;
  }
  this.nethost.RTCHandle.send({
    cmd: 'ice',
    identity: this.target,
    data: {
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }
  });
};
