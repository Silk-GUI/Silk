#!/usr/bin/env node

var program = require('commander');

program
  .version('0.1.0')
  .option('-r, --remote', 'Remotely access Silk')
  .option('-d, --dev', 'Show debug messages')
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

if(program.dev){
  global.debug = function(message){
    console.log(message);
  }
}
else{
  global.debug = function(){}
}
require("./server.js");
