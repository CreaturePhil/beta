var chalk = require('chalk');

module.exports = function() {
  var args = arguments[0];
  for (var i = 1, len = arguments.length; i < len; i++) {
    args += chalk.bold.gray(" | ") + arguments[i];
  }
  console.log(chalk.bold.red('DEBUG: ') + args);
}
