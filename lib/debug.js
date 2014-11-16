var util = require('util');
var chalk = require('chalk');

module.exports = function(arg) {
  if (typeof arg === typeof Function) {
    console.log(chalk.bold.red('DEBUG: ') + chalk.bgWhite.black(arg.toString()));
  } else {
    console.log(chalk.bold.red('DEBUG: ') + chalk.bgWhite.black('%j'), arg);
  }
};
