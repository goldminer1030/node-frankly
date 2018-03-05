var express = require('express');
var router = express.Router();
var passport = require('../config/passport.js');

router.get('/', function (req, res) {
  res.render('users/login', { error: req.flash('error') });
});

router.post('/', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

module.exports = router;