var express = require('express');

var resource = require('../lib/resource');

var mainController = require('../app/controllers/main_controller');
var userController = require('../app/controllers/user_controller');
var apiUsersController = require('../app/controllers/api/users');
var login_required = require('./passport').isAuthenticated;

var router = express.Router();

router.route('/')
  .get(mainController.index);

router.route('/about')
  .get(mainController.about);

router.route('/signup')
  .get(userController.signup.get)
  .post(userController.signup.post);

router.route('/login')
  .get(userController.login.get)
  .post(userController.login.post);

router.route('/logout')
  .get(userController.logout);

router.route('/forgot_password')
  .get(userController.forgotPassword.get)
  .post(userController.forgotPassword.post);

router.route('/reset_password/:token')
  .get(userController.resetPassword.get)
  .post(userController.resetPassword.post);

router.route('/settings/account')
  .get(login_required, userController.account.get)
  .post(login_required, userController.account.post);

router.route('/settings/password')
  .get(login_required, userController.updatePassword.get)
  .post(login_required, userController.updatePassword.post);

router.route('/settings/delete')
  .get(login_required, userController.deleteAccount.get)
  .post(login_required, userController.deleteAccount.post);

resource('/api/users', apiUsersController, router);

router.route('/:user')
  .get(userController.profile);

module.exports = router;
