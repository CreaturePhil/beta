var async = require('async');
var debug = require('../../../lib/debug');

var User = require('../../models/user');

module.exports = {

  index: function(req, res, next) {
    User.find({}, function(err, users) {
      if (err) return next(err);
      async.map(users, function(userModel, cb) {
        user = userModel.toObject();
        user._id = userModel.getHash();
        remove(user, 'email', 'password', '__v', 'resetPasswordToken', 'resetPasswordExpires');
        cb(null, user);
      }, function(err, results) {
        if (err) return next(err);
        res.json(results);
      });
    });
  },

};

/**
 * Delete one or more object's properties.
 * @param {Object} obj
 */
function remove(obj) {
  var len = arguments.length;
  while(len--) {
    if (len === 0) break;
    delete obj[arguments[len]];
  }
}
