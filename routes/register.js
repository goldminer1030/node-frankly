var express = require('express');
var router = express.Router();
var passport = require('../config/passport.js');

router.get('/', function (req, res) {
  res.render('users/register', { error: req.flash('error') });
});

router.post('/', passport.authenticate('local-register', {
    successRedirect: '/login', // redirect to the secure profile section
    failureRedirect: '/register', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  })
);

module.exports = router;