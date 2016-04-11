var logLevel = 0;
var logLevels = ['debug', 'info', 'warn', 'error'];
var spinnerMessageLength = 0;

process.on('SIGINT', function () {
  // put prompt on line after ^c
  console.log('');
  process.exit();
});


// loading spinner
function Spinner(message) {
  this.step = 0;
  this.pattern = '|/-\\';
  var interval;
  spinnerMessageLength = message.length + 2;
  this.start = function () {
    var that = this;
    process.stdout.write(that.pattern[that.step] + message + ' \r');
    interval = setInterval(function () {
      process.stdout.write(' ' + that.pattern[that.step] + message + ' \r');
      that.step += 1;
      if (that.step === 4) {
        that.step = 0;
      }
    }, 150);
  };
  this.stop = function () {
    clearInterval(interval);
  };
}

var log = {
  debug: function (message) {
    if (logLevels.indexOf('debug') < logLevel) {
      return;
    }
    process.stdout.write((new Array(spinnerMessageLength + 1)).join(' ') + ' \r');
    console.log(message);
  },
  info: function (message) {
    if (logLevels.indexOf('info') < logLevel) {
      return;
    }
    process.stdout.write((new Array(spinnerMessageLength + 1)).join(' ') + ' \r');

    console.info(message);
  },
  warn: function (message) {
    if (logLevels.indexOf('warn') < logLevel) {
      return;
    }
    process.stdout.write((new Array(spinnerMessageLength + 1)).join(' ') + ' \r');

    console.warn(message);
  },
  error: function (message) {
    if (logLevels.indexOf('error') < logLevel) {
      return;
    }
    process.stdout.write((new Array(spinnerMessageLength + 1)).join(' ') + ' \r');

    console.error(message);
  }
};

module.exports = {
  log: log,
  Spinner: Spinner,
  logLevel: function (number) {
    if (typeof number === 'undefined') {
      return logLevel;
    }
    logLevel = number;
  }
};
