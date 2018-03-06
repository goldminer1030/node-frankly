var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('users/profile', {
    user: req.user,
    messages: null
  });
});

module.exports = router;