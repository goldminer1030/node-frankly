var express = require('express');
var router = express.Router();
var passport = require('../config/passport.js');

router.get('/', function (req, res) {
  res.render('reset_password/reset_password', {
    email: req.flash("email")[0],
    loginError: req.flash('loginError'),
    loginMessage: req.flash('loginMessage')
  });
});

router.post('/', passport.authenticate('local-login', {
  successRedirect: '/posts',
  failureRedirect: '/login',
  failureFlash: true
})
);

module.exports = router;