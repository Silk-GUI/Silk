var domain = require('domain'),
  ports = {},
  autoStart = false;
/**
 * Manages localtunnel for one port.
 * @constructor
 * @param {number} port - port number
 */
function Remote(port) {
  this.port = port;
  this.status = 'stopped';
  this.url = null;
  var remoteDomain = domain.create();
  var that = this;
  this.close = function () {};

  remoteDomain.on('error', function (err) {
    console.log(err);
    try {
      that.close();
    } catch (e) {
      console.log(e);
    }
    that.status = 'stopped';
    that.start();
  });

  this.start = function () {
    var that = this;
    remoteDomain.run(function () {
      var localtunnel = require('localtunnel');
      //TODO if status is stopped and url is not null try to start with the url.
      localtunnel(that.port, function (err, tunnel) {
        if (err) {
          console.log(err);
          this.url = null;
          this.status = 'stopped';
          return;
        }
        this.close = tunnel.close;
        this.url = tunnel.url;
        this.status = 'running';
        Silk.set("remote/url", tunnel.url);
        Silk.set("remote/close", tunnel.close);

        if (that.port === 3000) {
          console.log("Go to " + tunnel.url + " to remotely access Silk");
        }

        tunnel.on("error", function (err) {
          console.log(err);

        });
        tunnel.on("close", function () {
          console.log("remote closed");
        });
      });
    })
  }

  if (autoStart === true) {
    this.start();
  }
}

ports[3000] = new Remote(3000);

/**
 * Makes app availalbe outisde this computer.  Starts localtunnel.
 * {number} options - localtunnel options.  Not used yet
 */
var start = function (port) {
  if (typeof port === 'number') {
    ports[port].start();
  } else {
    if (typeof port === 'boolean') {
      autoStart = true;
    }
    for (port in ports) {
      ports[port].start();
    }
  }
}

var close = function (port) {
  if (typeof port === 'number') {
    ports[port].close();
  } else {
    if (typeof port === 'boolean') {
      autoStart = false;
    }
    for (port in ports) {
      ports[port].close();
    }
  }
}

function addPort(port) {
  ports[port] = new Remote(port);
}

function removePort(port) {
  ports[port].close();
  delete ports[port];
}
Silk.set('remote/start', start);
Silk.set('remote/close', close);
Silk.set('remote/ports', ports);
Silk.set('remote/addPort', addPort);