var router = require('./routes');
var debug = require('../lib/debug');

module.exports = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  session: process.env.SESSION || 'Your Session Secret goes here',

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  },

  hash: 'Your Hash Secret here',

  banUsernames: []

};

/**
 * Ban usernames that are the same as routes because
 * the server maps username to the index route (/).
 */
function getBanUsernames() {
  var usernames = [];
  var routes = router.stack;
  var len = routes.length;
  while(len--) {
    usernames.push(routes[len].route.path.substr(1));
  }
  
  return usernames;
}
