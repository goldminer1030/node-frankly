var express = require('express');
var router = express.Router();
var passport = require('../config/passport.js');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

router.get('/', function (req, res) {
  res.render('users/register', { error: req.flash('error') });
});

router.post('/', upload.single('img'), passport.authenticate('local-register', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/register', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  })
);

module.exports = router;