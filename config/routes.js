var express = require('express');

var mainController = require('../app/controllers/main_controller');

var router = express.Router();

router.route('/')
  .get(mainController.index);

router.route('/about')
  .get(mainController.about);

module.exports = router;
