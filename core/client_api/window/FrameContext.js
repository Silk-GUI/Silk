/* eslint-disable block-scoped-var */
/* global $ jQuery */

if (typeof module !== 'undefined' && module.exports) {
  var WinAbs = require('./WindowAbstract'); // eslint-disable-line vars-on-top
}
/**
 A managers way of talking to windows
 @constructor
 @augments WinAbs
 @memberof ClientSide
 @param {window} manager - the manager it belongs to
 @param {object} winconfig - the configuration for the window
 */
function FrameContext(manager, winconfig) {
  manager.emit('preBuild', winconfig);
  if (!('id' in winconfig)) {
    throw new Error('I want to ensure you are in control');
  }
  this.id = winconfig.id;
  this.manager = manager;
  this.config = winconfig;
  console.log(1);
  Object.defineProperty(this, 'state', {
    get: function () {
      var doc;
      if (typeof this.frame === 'undefined') {
        return 'dormant';
      }
      doc = this.frame[0].contentDocument || this.frame[0].contentWindow.document;
      if (doc.readyState !== 'complete') {
        return 'loading';
      }
      if (!this.channel) {
        return 'buildingchannel';
      }
      return 'running';
    }
  });
  WinAbs.call(this);
  console.log(2);
  this.buildMethods();
  console.log(3);
}
FrameContext.prototype = Object.create(WinAbs.prototype);
FrameContext.prototype.constructor = FrameContext;

/**
 Opens up the frame within the container or becomes the container
 @memberof FrameContext
 @param {HTMLDomElement} container - container to append to or the iframe to become
 */
FrameContext.prototype.open = function (container) {
  var self = this;
  var ret;

  if (this.state !== 'dormant') {
    throw Error('This window is already open');
  }
  if (typeof container === 'undefined') {
    throw Error('To Open, this window needs a container');
  }
  container = $(container);
  if (container.prop('tagName').toLowerCase() !== 'iframe' ||
    container.attr('src') !== this.config.url) {
    this.frame = '<iframe class="content" data-name="' + this.config.title + '" src="' +
      this.config.url + '"></iframe>';
    this.frame = $(this.frame);
  } else {
    this.frame = container;
    console.log(this.frame);
    container = false;
  }
  ret = jQuery.Deferred(); // eslint-disable-line new-cap
  if (container) {
    container.append(this.frame);
  }
  WinAbs.prototype.open.call(self, self.frame[0].contentWindow, function () {
    ret.resolve(self);
  });
  return ret;
};

FrameContext.prototype.buildMethods = function () {
  var self = this;
  this.add('openFile', function (params) {
    console.log('was bound, heard files');
    self.manager.openFile(self, params);
    return null;
  });
  this.add('reverse', function (s) {
    console.log('received message: ' + s);
    return s.split('').reverse().join('');
  });
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrameContext;
}
