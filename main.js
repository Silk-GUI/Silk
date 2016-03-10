global.__root = __dirname;
var http = require('http');
var express = require('express');
var SockJS = require('sockjs');
var program = require('commander');
var configJson = require('./config.json');
var logger = require('./core/console.js');
var apiData = require('./core/api_data.js');
var endedWith = require('./core/util/ended_with.js');

//commands
var run = require('./core/commands/run.js'),
    addApp = require('./core/commands/add_app.js'),
    removeApp = require('./core/commands/remove_app.js');

process.title = "Silk GUI";



program
  .version('0.5.2')
  .option('-r, --remote', 'Remotely access Silk')
  .option('-d, --dev', 'Show debug messages')
  .option('-o, --open', 'Open Silk in a window');

program
  .command('run')
  .description('Starts silk. Default command.')
  .action(run);

program
  .command('add-app [path]')
  .description('add app')
  .action(addApp);

program
  .command('remove-app [path]')
  .description('remove app')
  .action(removeApp);

program
  .parse(process.argv);

var lastArgv = process.argv[process.argv.length -1];
//console.log(lastArgv);
if(lastArgv === 'help' || lastArgv === 'help') {
  // silk help or npm start help was run.
  program.help();
  process.exit(0);
}


// Silk was run with no command, so we do the default
// Setting a default command appears to be broken in commander.js
// so we implement it ourselves.
if(lastArgv === 'silk-gui') {
  console.log('no command');
} else if(endedWith(lastArgv, 'main.js')){
  run();
}

logger.logLevel(program.dev ? 0 : 1);
