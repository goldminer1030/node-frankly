var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('terms/terms', {
    title: 'Terms',
    description: 'This is terms'
  });
});

module.exports = router;