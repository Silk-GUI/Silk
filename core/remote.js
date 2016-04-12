var domain = require('domain');
var apiData = require('./api_data.js');
var ports = {};
var autoStart = false;
/**
 * Manages localtunnel for one port.
 * @constructor
 * @param {number} port - port number
 */
// TODO notify Silk of changes
function Remote(port) {
  var remoteDomain = domain.create();
  var self = this;

  this.port = port;
  this.status = 'stopped';
  this.url = null;

  this.close = function () {
  };

  remoteDomain.on('error', function (err) {
    console.log(err);
    try {
      self.close();
    } catch (e) {
      console.log(e);
      // error closing tunnel.
      return;
    }
    self.status = 'stopped';
    self.start();
  });

  this.start = function () {
    var self = this;
    remoteDomain.run(function () {
      var localtunnel = require('localtunnel');
      // TODO if status is stopped and url is not null try to start with the url.
      localtunnel(self.port, function (err, tunnel) {
        if (err) {
          console.log(err);
          this.url = null;
          this.status = 'stopped';
          return;
        }
        this.close = tunnel.close;
        this.url = tunnel.url;
        this.status = 'running';
        apiData.set('remote/url', tunnel.url);
        apiData.set('remote/ports', ports);
        if (self.port === 3000) {
          console.log('Go to ' + tunnel.url + ' to remotely access Silk');
        }

        tunnel.on('error', function (err) {
          console.log(err);
        });
        tunnel.on('close', function () {
          console.log('remote closed');
        });
      });
    });
  };

  if (autoStart === true) {
    this.start();
  }
}

ports[3000] = new Remote(3000);

/**
 * Makes app availalbe outisde this computer.  Starts localtunnel.
 * {number} options - localtunnel options.  Not used yet
 */
function start(port) {
  if (typeof port === 'number') {
    ports[port].start();
  } else {
    if (typeof port === 'boolean') {
      autoStart = true;
    }
    for (port in ports) {
      if (ports.hasOwnProperty(port)) {
        ports[port].start();
      }
    }
    console.log('started all ports');
  }
}

function close(port) {
  if (typeof port === 'number') {
    ports[port].close();
  } else {
    if (typeof port === 'boolean') {
      autoStart = false;
    }
    for (port in ports) {
      if (ports.hasOwnProperty(port)) {
        ports[port].close();
      }
    }
    apiData.set('remote/ports', ports);
  }
}

function addPort(port) {
  ports[port] = new Remote(port);
}

function removePort(port) {
  ports[port].close();
  delete ports[port];
}

apiData.set('remote/start', start);
apiData.set('remote/close', close);
apiData.set('remote/ports', ports);
apiData.set('remote/addPort', addPort);
apiData.set('remote/removePort', removePort);
