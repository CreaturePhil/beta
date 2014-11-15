var router = require('./routes');

module.exports = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  },

  banUsernames: getBanUsernames()

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
