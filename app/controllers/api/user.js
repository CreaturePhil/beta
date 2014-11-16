var User = require('../../models/user');

module.exports = {

  index: function(req, res, next) {
    User.find({}, function(err, users) {
      if (err) return next(err);
      res.json(users);
    });
  },

};
