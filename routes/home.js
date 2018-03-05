var express = require('express');
var router = express.Router();
var User = require('../models/User');

router.get('/', function (req, res) {
  var domain = req.get('host').match(/\w+/); // e.g., host: "subdomain.website.com"
  if (domain) {
    var subdomain = domain[0]; // Use "subdomain"
    
    if (!req.user && (domain == 'www' || domain == 'localhost')) {
      // if main domain
      res.render('index');
    } else {
      User.findOne({ username: subdomain }, function (err, user) {
        if (!err && user) {
          if (req.user && subdomain == req.user.username) {
            res.render('users/profile', {
              user: req.user
            });
          } else {
            res.render('users/message', {
              user: user
            });
          }
        } else {
          // no user with this subdomain
          res.render('404');
        }
      });
    }
  }
});

router.post('/delete', function (req, res, next) {
  var userId = req.body.id || req.query.id;

  console.log(userId);
  // User.remove({ _id: userId }, function (err, res) {
  //   if (err) {
  //     res.json({ "err": err });
  //   } else {
  //     res.json({ success: true });
  //   }
  // });
});

// LOGOUT ==============================
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
