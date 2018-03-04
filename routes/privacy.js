var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('privacy/privacy', {
    title: 'Privacy',
    description: 'This is privacy'
  });
});

module.exports = router;