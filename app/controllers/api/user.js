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
        delete user.password;
        delete user.__v;
        cb(null, user);
      }, function(err, results) {
        if (err) return next(err);
        res.json(results);
      });
    });
  },

};
