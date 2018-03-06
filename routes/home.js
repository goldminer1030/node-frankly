var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Message = require('../models/Message');

router.get('/', function (req, res) {
  var domain = req.get('host').match(/\w+/); // e.g., host: "subdomain.website.com"
  console.log("domain", domain);
  if (domain) {
    if (!req.user && (domain == 'www' || domain == 'localhost' || domain == 'wearehighlyeffective.website')) {
      // if main domain
      res.render('index');
    } else {
      var subdomain = domain[0]; // Use "subdomain"
      console.log("subdomain", subdomain);
      if(req.user) {
        subdomain = req.user.username;
      }
      User.findOne({ username: subdomain }, function (err, user) {
        if (!err && user) {
          if (req.user && subdomain == req.user.username) {
            Message.find({ username: subdomain }, function (err, message) {
              if (!err && message) {
                res.render('users/profile', {
                  user: req.user,
                  messages: message
                });
              } else {
                res.render('users/profile', {
                  user: req.user,
                  messages: null
                });
              }
            });
          } else {
            res.render('users/message', {
              user: user,
              isReSend: false,
              success: false,
              message: ''
            });
          }
        } else {
          // no user with this subdomain
          // res.render('404');
          res.render('index');
        }
      });
    }
  }
});

router.post('/', function (req, res, next) {
  var type = req.body.type;

  if(type == 'send-msg') {
    // SEND MESSAGE ==============================
    var domain = req.get('host').match(/\w+/); // e.g., host: "subdomain.website.com"
    var message = req.body.textmessage;
  
    if (domain) {
      var subdomain = domain[0]; // Use "subdomain"
      if (req.user || (subdomain != 'www' && subdomain != 'localhost' && domain != 'wearehighlyeffective.website')) {
        User.findOne({ username: subdomain }, function (err, user) {
          if (!err && user) {
            // create new message
            var newMessage = new Message();
  
            newMessage.username = subdomain;
            newMessage.content = message;
  
            newMessage.save(function (err) {
              var isSuccess = true;
              if (err) isSuccess = false;
              
              res.render('users/message', {
                user: user,
                isReSend: true,
                success: isSuccess,
                message: message
              });
            });
          } else {
            res.redirect('/');
          }
        });
      }
    }
  } else if (type == 'delete-msg') {
    // DELETE MESSAGE ==============================
    var messageId = req.body.id || req.query.id;
    var domain = req.get('host').match(/\w+/); // e.g., host: "subdomain.website.com"

    if (domain) {
      var subdomain = domain[0]; // Use "subdomain"
      if (req.user || (subdomain != 'www' && subdomain != 'localhost' && domain != 'wearehighlyeffective.website')) {
        Message.findOneAndRemove({ _id: messageId, username: subdomain }, function (err, message) {
          if (err) return res.json({ success: false, message: err });
          if (!message) return res.json({ success: false, message: "No data found to delete" });
          res.redirect('/');
        });
      }
    }
  }
});

// LOGOUT ==============================
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
