var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('../config/passport.js');

router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('index', {
      title: 'Frankly.',
      description: 'This is frankly website'
    });
  } else {
    res.render('index', {
      title: 'Frankly.',
      description: 'This is frankly website'
    });
  }
});

module.exports = router;
