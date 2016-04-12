/* global Server NetworkInstance RSVP EventEmitter DocumentHost ApplicationFork */
// eslint doesn't like how we use the global variables
/* eslint-disable block-scoped-var */

if (typeof module !== 'undefined' && module.exports) {
  var Server = require('../window/Window2Server_com.js'); // eslint-disable-line vars-on-top
  var NetworkInstance = require('./NetworkUser.js');  // eslint-disable-line vars-on-top
  var RSVP = require('rsvp'); // eslint-disable-line vars-on-top
}
/**
 Creates a new Network host. A network host provides a manner to find users with
 a compatible app as yours. The manner in which they find other users is meaningless.
 However, it provides a way to make an offer to another user and to accept an offer.
 @constructor
 @memberof ClientSide
 @augments EventEmitter
 @param {string} url - the url that hosts the users you wish to find
 @param {object} info - the info you wish to give inorder for other users to find you
 @param {object} config - configuration, mostly just specifying ice servers
 @param {object} sconfig - data configuration, in case you are interested in that
 */
function NetworkHost(url, info, config, sconfig) {
  EventEmitter.call(this);
  this.on = this.addListener.bind(this);
  this.off = this.removeListener.bind(this);
  if (!config) {
    config = {
      iceServers: [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
        { url: 'stun:stun2.l.google.com:19302' },
        { url: 'stun:stun3.l.google.com:19302' },
        { url: 'stun:stun4.l.google.com:19302' },
        { url: 'stun:stun01.sipphone.com' },
        { url: 'stun:stun.ekiga.net' },
        { url: 'stun:stun.fwdnet.net' },
        { url: 'stun:stun.ideasip.com' },
        { url: 'stun:stun.iptel.org' },
        { url: 'stun:stun.rixtelecom.se' },
        { url: 'stun:stun.schlund.de' },
        { url: 'stun:stunserver.org' },
        { url: 'stun:stun.softjoys.com' },
        { url: 'stun:stun.voiparound.com' },
        { url: 'stun:stun.voipbuster.com' },
        { url: 'stun:stun.voipstunt.com' },
        { url: 'stun:stun.voxgratia.org' },
        { url: 'stun:stun.xten.com' },
        { url: 'stun:23.21.150.121' }
      ]
    };
    console.log('Stun server should be same as document url');
  }
  if (!sconfig) {
    sconfig = { reliable: false };
  }
  this.config = config;
  this.sconfig = sconfig;
  if (url && DocumentHost.url !== url) {
    url = /^http(s?):\/\/([0-9\.]+|[a-z\-.]+)((?::)[0-9]+)?(.*)$/.exec(url);
    this.RTCHost = new Server(url[2], url[3] || 80);
  } else {
    this.RTCHost = ApplicationFork;
  }
  this.connections = {};
  if (info) {
    this.connect(info);
  }
  return this;
}
NetworkHost.prototype = Object.create(EventEmitter.prototype);
NetworkHost.prototype.constructor = NetworkHost;

/**
 if info was not provided, this is a manner to connect.
 @memberof NetworkHost
 @param {object} info - info that the server and other users may will see
 */
NetworkHost.prototype.connect = function (info) {
  var self = this;

  if (!info) {
    throw new Error('Network Server may not be able to handle no information');
  }
  this.info = info;
  this.RTCHandle = this.RTCHost.pipe('RTC-user', info, function (error, data) {
    if (error) {
      return console.error(JSON.stringify(error));
    }
    if (data.cmd === 'offer') {
      return self.emit('offer', data);
    }
    if (data.cmd === 'list') {
      console.log('list');
      return self.emit('userlist', data.data);
    }
    if (data.cmd === 'accept') {
      if (!self.connections[data.identity]) {
        return console.log('accepting a gift ungiven');
      }
      self.connections[data.identity].ok(data);
      return self.emit('handshake', self.connections[data.identity]);
    }
    if (data.cmd === 'ice') {
      console.log('host ice');
      self.connections[data.identity].remoteIce(data.data);
    }
  });
};

/**
 Closes all user connections
 @memberof NetworkHost
 */
NetworkHost.prototype.closeAll = function () {
  var i;

  for (i in this.connections) {
    if (this.connections.hasOwnProperty(i)) {
      this.connections[i].close();
    }
  }
};
/**
 Makes an offer directed at a specific user
 @memberof NetworkHost
 @param {string} identity - the namespace that identifies users individually
 */
NetworkHost.prototype.offer = function (identity) {
  var promise = new RSVP.Promise(function (resolve, reject) {
    this.connections[identity] = new NetworkInstance(this, identity);
    this.connections[identity].offer(identity, function (err, cur) {
      if (err) {
        return reject(err);
      }
      resolve(cur);
    });
  }.bind(this));
  return promise;
};
/**
 Accepts an offer
 @memberof NetworkHost
 @param {object} message - the message that was originally given
 */
NetworkHost.prototype.offerAccept = function (message) {
  var promise = new RSVP.Promise(function (resolve, reject) {
    var identity = message.identity;
    this.connections[identity] = new NetworkInstance(this, identity);
    this.connections[identity].accept(message, function (err, cur) {
      if (err) {
        return reject(err);
      }
      resolve(cur);
    });
  }.bind(this));
  return promise;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NetworkHost;
}
