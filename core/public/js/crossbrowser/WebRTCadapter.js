/* global RTCPeerConnection getUserMedia attachMediaStream reatachMediaStream */
/* global attachMediaStream reattachMediaStream MediaStream*/
/* global mozRTCPeerConnection mozRTCSessionDescriptin mozRTCIceCandidate */
/* global mozRTCSessionDescription */
/* global webrtcDetectedBrowser webrtcDetectedVersion */
/* global webkitMediaStream webkitRTCPeerConnection webkitMediaStream*/
/* global createIceServer */
/* eslint-disable no-native-reassign */

window.RTCPeerConnection = null;
window.getUserMedia = null;
window.attachMediaStream = null;
window.reattachMediaStream = null;
window.webrtcDetectedBrowser = null;
window.webrtcDetectedVersion = null;

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] === '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ': ' + text);
}

if (navigator.mozGetUserMedia) {
  trace('This appears to be Firefox');

  webrtcDetectedBrowser = 'firefox';

  webrtcDetectedVersion =
    parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);

  // The RTCPeerConnection object.
  RTCPeerConnection = mozRTCPeerConnection;

  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription;

  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);

  // Creates iceServer from the url for FF.
  createIceServer = function (url, username, password) {
    var turnUrlParts;
    var iceServer = null;
    var urlParts = url.split(':');
    if (urlParts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { url: url };
    } else if (urlParts[0].indexOf('turn') === 0 &&
      (url.indexOf('transport=udp') !== -1 ||
      url.indexOf('?transport') === -1)) {
      // Create iceServer with turn url.
      // Ignore the transport parameter from TURN url.
      turnUrlParts = url.split('?');
      iceServer = {
        url: turnUrlParts[0],
        credential: password,
        username: username
      };
    }
    return iceServer;
  };

  // Attach a media stream to an element.
  attachMediaStream = function (element, stream) {
    console.log('Attaching media stream');
    element.mozSrcObject = stream;
    element.play();
  };

  reattachMediaStream = function (to, from) {
    console.log('Reattaching media stream');
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function () {
    return [];
  };

  MediaStream.prototype.getAudioTracks = function () {
    return [];
  };
} else if (navigator.webkitGetUserMedia) {
  console.log('This appears to be Chrome');

  webrtcDetectedBrowser = 'chrome';
  webrtcDetectedVersion =
    parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);

  // Creates iceServer from the url for Chrome.
  createIceServer = function (url, username, password) {
    var urlTurnParts;
    var iceServer = null;
    var urlParts = url.split(':');
    if (urlParts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { url: url };
    } else if (urlParts[0].indexOf('turn') === 0) {
      if (webrtcDetectedVersion < 28) {
        // For pre-M28 chrome versions use old TURN format.
        urlTurnParts = url.split('turn:');
        iceServer = {
          url: 'turn:' + username + '@' + urlTurnParts[1],
          credential: password
        };
      } else {
        // For Chrome M28 & above use new TURN format.
        iceServer = {
          url: url,
          credential: password,
          username: username
        };
      }
    }
    return iceServer;
  };

  // The RTCPeerConnection object.
  RTCPeerConnection = webkitRTCPeerConnection;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

  // Attach a media stream to an element.
  attachMediaStream = function (element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };

  reattachMediaStream = function (to, from) {
    to.src = from.src;
  };

  // The representation of tracks in a stream is changed in M26.
  // Unify them for earlier Chrome versions in the coexisting period.
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function () {
      return this.videoTracks;
    };
    webkitMediaStream.prototype.getAudioTracks = function () {
      return this.audioTracks;
    };
  }

  // New syntax of getXXXStreams method in M26.
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function () {
      return this.localStreams;
    };
    webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
      return this.remoteStreams;
    };
  }
} else {
  console.log('Browser does not appear to be WebRTC-capable');
}
