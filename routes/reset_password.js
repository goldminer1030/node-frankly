var express = require('express');
var router = express.Router();
var passport = require('../config/passport.js');

router.get('/', function (req, res) {
  res.render('reset_password/reset_password');
});

router.post('/', function (req, res) {
  res.render('reset_password/reset_password');
});

module.exports = router;