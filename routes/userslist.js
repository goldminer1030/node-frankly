var express = require('express');
var router = express.Router();
var User = require('../models/User');

router.get('/', function (req, res) {
  User.find({}, function (err, users) {
    var data = [];
    var usersList = {};
    if (err) {
      return res.send(usersList);
    }
    
    users.forEach(function (user) {
      data.push(user.username);
    });
    usersList = data;

    res.send(usersList);
  });
});

module.exports = router;