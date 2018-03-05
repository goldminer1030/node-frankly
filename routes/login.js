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

// send to facebook to do the authentication
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// handle the callback after facebook has authenticated the user
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  })
);

module.exports = router;