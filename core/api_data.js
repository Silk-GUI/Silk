/**
 * @file Constructer to Stores prop and value pairs and alerts listeners on change
 */

/**
 * Stores prop and value pairs and alerts listeners on change
 * @constructer
 */
var WatchData = function () {
  var notify;
  /**
   * Data is stored here.  data[prop] = {value: value, listeners[array of functions]}
   */
  this.data = {};
  /**
   * Notifies listeners of a change
   * @param {string} prop - name of property that changed
   * @param {*} oldValue - old value of property
   * @param {*} currentValue - new value of property
   */
  notify = function (prop, oldValue, currentValue) {
    var listeners = this.data[prop].listeners;
    var i;

    if (listeners.length === 0) {
      return;
    }
    for (i = 0; i < listeners.length; ++i) {
      listeners[i](prop, oldValue, currentValue);
    }
  }.bind(this);

  /**
   * Sets data and alerts listeners
   */
  this.set = function (prop, value) {
    var oldValue;

    if (prop in this.data) {
      oldValue = this.data[prop].value;
      this.data[prop].value = value;
      notify(prop, oldValue, value);
    } else {
      this.data[prop] = {
        value: value,
        listeners: []
      };
      // don't call notify since there are no listeners.
    }
  }.bind(this);

  /**
   * Returns the value for prop
   * @param {string} prop - name of property to return value for
   */
  this.get = function (prop) {
    return this.data[prop] ? this.data[prop].value : undefined;
  }.bind(this);

  /**
   * Adds a listener to prop to be notified of changes to prop's value
   * @param {string} prop - property to watch
   * @param {function} cb - callback
   */
  this.watch = function (prop, cb) {
    if (!(prop in this.data)) {
      return;
    }
    this.data[prop].listeners.push(cb);
  }.bind(this);
};

module.exports = new WatchData();
