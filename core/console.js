var logLevel = 0;
var logLevels = ['debug', 'info', 'warn', 'error'];
var spinnerMessageLength = 0;
var log;

process.on('SIGINT', function () {
  // put prompt on line after ^c
  console.log('');
  process.exit();
});

// loading spinner
function Spinner(message) {
  var interval;

  this.step = 0;
  this.pattern = '|/-\\';

  spinnerMessageLength = message.length + 2;
  this.start = function () {
    var self = this;
    process.stdout.write(self.pattern[self.step] + ' ' + message + ' \r');
    interval = setInterval(function () {
      process.stdout.write(' ' + self.pattern[self.step] + ' ' + message + ' \r');
      self.step += 1;
      if (self.step === 4) {
        self.step = 0;
      }
    }, 150);
  };
  this.stop = function () {
    clearInterval(interval);
  };
}

function clearSpinner() {
  process.stdout.write((new Array(spinnerMessageLength + 1)).join(' ') + ' \r');
}

log = {
  debug: function (message) {
    if (logLevels.indexOf('debug') < logLevel) {
      return;
    }
    clearSpinner();
    console.log(message);
  },
  info: function (message) {
    if (logLevels.indexOf('info') < logLevel) {
      return;
    }

    clearSpinner();

    console.info(message);
  },
  warn: function (message) {
    if (logLevels.indexOf('warn') < logLevel) {
      return;
    }
    clearSpinner();

    console.warn(message);
  },
  error: function (message) {
    if (logLevels.indexOf('error') < logLevel) {
      return;
    }
    clearSpinner();

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
