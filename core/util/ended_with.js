// returns true if the supplied string ends with the supplied ending
module.exports = function (string, ending) {
  return string.indexOf(ending) === string.length - ending.length;
};
