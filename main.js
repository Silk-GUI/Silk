var program = require('commander');
var updateNotifier = require('update-notifier');
var path = require('path');

var logger = require('./core/console.js');
var endedWith = require('./core/util/ended_with.js');
// TODO: remove global
var __root = global.__root = require('./root.js'); // eslint-disable-line no-unused-vars

// commands
var run = require('./core/commands/run.js');
var addApp = require('./core/commands/add_app.js');
var removeApp = require('./core/commands/remove_app.js');
var pkg = require('./package.json');

var notifier;
var lastArgv;

// if the environment variable is set to 1,
// this will log the file and line that outputs
// to the terminal
if (process.env.TRACE_CONSOLE) {
  ['log', 'warn'].forEach(function (method) {
    var old = console[method];
    console[method] = function () {
      var stack = (new Error()).stack.split(/\n/);
      var args;

      args = [].slice.apply(arguments)
        .concat([stack[1].trim()]);
      return old.apply(console, args);
    };
  });
}

// update notification
notifier = updateNotifier({
  pkg: {
    name: pkg.name,
    version: pkg.version
  },
  updateCheckInterval: 1000 * 60 * 60 * 6, // check every 6 hours
  defer: false
});
notifier.notify();

process.title = 'Silk GUI';

program
  .version(pkg.version)
  .option('-r, --remote', 'Remotely access Silk')
  .option('-v, --verbose', 'Shows more messages')
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

lastArgv = process.argv[process.argv.length - 1];
if (lastArgv === 'help' || lastArgv === 'help') {
  // silk help or npm start help was run.
  program.help();
  process.exit(0);
}

// Silk was run with no command, so we do the default
// Setting a default command appears to be broken in commander.js
// so we implement it ourselves.
if (lastArgv === 'silk') {
  run();
} else if (endedWith(lastArgv, 'main.js')) {
  run();
} else if (endedWith(lastArgv, path.sep + 'bin' + path.sep + 'silk')) {
  run();
} else if (endedWith(lastArgv, 'bin.js')) {
  run();
}

logger.logLevel(program.verbose ? 0 : 1);
