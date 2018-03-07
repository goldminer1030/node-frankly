var express = require('express');
var router = express.Router();
var passport = require('../config/passport.js');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

router.get('/', function (req, res) {
  res.render('users/register', { error: req.flash('error') });
});

router.post('/', upload.single('img'), passport.authenticate('local-register', {
    successRedirect: '/login', // redirect to the secure profile section
    failureRedirect: '/register', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
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