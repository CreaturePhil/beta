var async = require('async');
var passport = require('passport');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var User = require('../models/user');
var secrets = require('../../config/secrets');

module.exports = {

  signup: {
    get: function(req, res) {
      if (req.user) return res.redirect('/');
      res.render('user/signup', { title: 'Create Account' });
    },
    post: function(req, res, next) {
      req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
      req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
      req.assert('email', 'Email is not valid.').isEmail();
      req.assert('password', 'Password must be between 4 to 300 characters long.').len(4, 300);
      req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

      var errors = req.validationErrors();

      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
      }

      var user = new User({
        uid: req.body.username.toLowerCase(),
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });

      if (secrets.banUsernames.indexOf(user.uid) >= 0) {
        req.flash('errors', { msg: 'Your username cannot be called that.' });
        return res.redirect('signup');
      }

      async.series([
        function(done) {
          User.findOne({ email: req.body.email }, function(err, existingUser) {
            if (existingUser) {
              req.flash('errors', { msg: 'Account with that email address already exists.' });
              return res.redirect('/signup');
            }
            done(err);
          });
        },
        function(done) {
          User.findOne({ uid: req.body.username.toLowerCase() }, function(err, existingUser) {
            if (existingUser) {
              req.flash('errors', { msg: 'Account with that username already exists.' });
              return res.redirect('/signup');
            }
            done(err);
          });
        },
        function(done) {
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err);
            });
          });
        }
      ], function(err) {
        if (err) next(err);
        res.redirect('/');
      });
    }
  },

  login: {
    get: function(req, res) {
      if (req.user) return res.redirect('/');
      res.render('user/login', {
        title: 'Login'
      });
    },

    post: function(req, res, next) {
      req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
      req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
      req.assert('password', 'Password cannot be blank').notEmpty();

      var errors = req.validationErrors();

      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/login');
      }

      passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
          req.flash('errors', { msg: info.message });
          return res.redirect('/login');
        }
        req.logIn(user, function(err) {
          if (err) return next(err);
          req.flash('success', { msg: 'Success! You are logged in.' });
          res.redirect(req.session.returnTo || '/');
        });
      })(req, res, next);
    }
  },

  logout: function(req, res) {
    req.logout();
    res.redirect('/');
  },

  forgotPassword: {
    get: function(req, res) {
      if (req.isAuthenticated()) return res.redirect('/');
      res.render('user/forgot_password', {
        title: 'Forgot Password'
      });
    },
    
    post: function(req, res, next) {
      req.assert('email', 'Please enter a valid email address.').isEmail();

      var errors = req.validationErrors();

      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
      }

      async.waterfall([
          function(done) {
            crypto.randomBytes(16, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          function(token, done) {
            User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
              if (!user) {
                req.flash('errors', { msg: 'No account with that email address exists.' });
                return res.redirect('/forgot_password');
              }

              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

              user.save(function(err) {
                done(err, token, user);
              });
            });
          },
          function(token, user, done) {
            var transporter = nodemailer.createTransport({
              service: 'SendGrid',
            auth: {
              user: secrets.sendgrid.user,
            pass: secrets.sendgrid.password
            }
            });
            var mailOptions = {
              to: user.email,
              from: 'markus@markus.com',
              subject: 'Reset your password on Markus',
              text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset_password/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function(err) {
              req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
              done(err, 'done');
            });
          }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot_password');
      });
    }
  },

  resetPassword: {
    get: function(req, res) {
      if (req.isAuthenticated()) return res.redirect('/');
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('/forgot');
          }
          res.render('user/reset_password', {
            title: 'Password Reset'
          });
        });
    },

    post: function(req, res, next) {
      req.assert('password', 'Password must be at least 4 characters long.').len(4);
      req.assert('confirmPassword', 'Passwords must match.').equals(req.body.password);

      var errors = req.validationErrors();

      if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
      }

      async.waterfall([
        function(done) {
          User
            .findOne({ resetPasswordToken: req.params.token })
            .where('resetPasswordExpires').gt(Date.now())
            .exec(function(err, user) {
              if (!user) {
                req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                return res.redirect('back');
              }

              user.password = req.body.password;
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save(function(err) {
                if (err) return next(err);
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            });
        },
        function(user, done) {
          var transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: secrets.sendgrid.user,
              pass: secrets.sendgrid.password
            }
          });
          var mailOptions = {
            to: user.email,
            from: 'markus@markus.com',
            subject: 'Your Markus password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          transporter.sendMail(mailOptions, function(err) {
            req.flash('success', { msg: 'Success! Your password has been changed.' });
            done(err);
          });
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/');
      }); 
    }
  },

  account: {
    get: function(req, res) {
      res.render('user/settings', {
        title: 'Account',
        description: 'Change your basic account settings.'
      });
    },
    
    post: function(req, res, next) {
      req.body.avatar && req.assert('avatar', 'Must be .png, .jpg, or .gif').regexMatch(/(https?:\/\/.*\.(?:png|jpg|gif))/i);
      req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
      req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
      req.body.website && req.assert('website', 'Invalid website url.').regexMatch(/https?:\/\/.{1,}\..{1,}/);
      req.assert('email', 'Email is not valid.').isEmail();
      req.assert('bio', 'Bio must be less than or equal to 160 characters.').len(0, 160);

      var errors = req.validationErrors();

      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/settings/account');
      }

      User.findById(req.user.id, function(err, user) {
        if (err) return next(err);
        user.profile.avatar = req.body.avatar || '';
        user.uid = req.body.username.toLowerCase(); 
        user.username = req.body.username;
        user.email = req.body.email;
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';
        user.profile.bio = req.body.bio || '';

        user.save(function(err) {
          if (err) return next(err);
          req.flash('success', { msg: 'Profile information updated.' });
          res.redirect('/settings/account');
        });
      });
    }
  },

  updatePassword: {
    get: function(req, res) {
      res.render('user/settings', {
        title: 'Password',
        description: 'Change your password.'
      });
    },

    post: function(req, res, next) {
      req.assert('password', 'Password must be at least 4 characters long').len(4);
      req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

      var errors = req.validationErrors();

      if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
      }

      User.findById(req.user.id, function(err, user) {
        if (err) return next(err);

        user.password = req.body.password;

        user.save(function(err) {
          if (err) return next(err);
          req.flash('success', { msg: 'Password has been changed.' });
          res.redirect('/settings/password');
        });
      });
    }
  },

  deleteAccount: {
    get: function(req, res) {
      res.render('user/delete_account', {
        title: 'Delete'
      }); 
    },

    post: function(req, res, next) {
      User.remove({ _id: req.user.id }, function(err) {
        if (err) return next(err);
        req.logout();
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect('/');
      });
    }
  },

  profile: function(req, res, next) {
    User.findOne({ uid: req.params.user.toLowerCase() }, function(err, user) {
      if (err || !user) return next(err);
      res.render('user/profile', {
        title: user.username,
        User: user
      });
    }); 
  }
  
};
