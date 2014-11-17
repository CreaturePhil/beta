module.exports = {

  regexMatch: function(arg, regex) {
    return arg.match(regex);
  },

  signupValidation: function(req) {
    req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
    req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
    req.assert('email', 'Email is not valid.').isEmail();
    req.assert('password', 'Password must be between 4 to 300 characters long.').len(4, 300);
    req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);

    return req.validationErrors();
  },

  loginValidation: function(req) {
    req.assert('username', 'Only letters and numbers are allow in username.').regexMatch(/^[A-Za-z0-9]*$/);
    req.assert('username', 'Username cannot be more than 30 characters.').len(1, 30);
    req.assert('password', 'Password cannot be blank').notEmpty();

    return req.validationErrors();
  }
              
};
