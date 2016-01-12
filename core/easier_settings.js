/**
 * @file wrapper around jsonFile to create file if it doesn't exist
 * and automatically save.
 */

var fs = require('fs'),
    jsonFile = require('json-file');

/**
 * Wrapper around jsonFile to create file it
 * it doesn't exist and automatically save changes
 * @param {string} settings - json file with this name will be used/created.
 * @constructor
 */
function Settings (settings) {
  if(!(this instanceof Settings)) {
    return new Settings(settings);
  }
  var self = this;
  // settings name
  self.name = settings;
  self.path = __root + '/core/settings' + settings + '.json';
  // load file or create if it doesn't exist
  try {
    data = jsonFile.read(path);
  } catch (e) {
    fs.writeFileSync(self.path, '{}');
    data = jsonFile.read(self.path);
  }
  return data;
}
/**
 * Sets the property and saves to disk
 * @param {string} prop - property to chaneg
 * @param {*} val - value to change property to
 */
Settings.prototype.set = function (prop, val) {
  self.data.set(prop, val);
  // should we use writeSync? data.write() might
  // cause race conditions if multiple places
  // change the same setting.
  self.data.write();
};

Settings.prototype.get = function (prop) {
  return self.data.get(prop);
};

module.exports = Settings;
