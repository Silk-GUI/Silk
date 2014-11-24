#!/usr/bin/env node

var program = require('commander');

program
  .version('0.1.0')
  .option('-r, --remote', 'Remotely access Silk')
  .parse(process.argv);
if (program.remote) {
  // make app availalbe outisde nodeos
  var localtunnel = require('localtunnel');

  localtunnel(3000, function (err, tunnel) {
    if (err) {
      console.log(err);
    }

    console.log("Go to " + tunnel.url + " to remotely access Silk");
  });

}
require("./server.js");