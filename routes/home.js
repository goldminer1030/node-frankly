var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Message = require('../models/Message');

router.get('/', function (req, res) {
  if (!req.user && res.locals.isMainDomain) {
    // if main domain
    res.render('index');
  } else {
    var subdomain = res.locals.subdomain;
    var loggedIn = false;
    
    if(req.user) {
      subdomain = req.user.username;
      loggedIn = true;
    }

    req.redis.get("username", function (err, value) {
      if (err) {
        console.error("error while getting from req.redis");
      } else {
        res.locals.username = value;
        res.locals.login = true;
        console.log("redis username: " + res.locals.username);
      }
    });
    
    console.log('res.locals.username', res.locals.username);
    console.log('subdomain', subdomain);
    User.findOne({ username: subdomain }, function (err, user) {
      if (!err && user) {
        if ((req.user && subdomain == req.user.username) || (res.locals.username.lenth > 0 && res.locals.username == subdomain)) {
          Message.find({ 'username': subdomain }).sort({ 'createdAt': -1 }).exec(function (err, message) {
            if (!err && message) {
              res.render('users/message', {
                user: req.user,
                loggedIn: loggedIn,
                isReSend: false,
                success: false,
                messages: message
              });
            } else {
              res.render('users/message', {
                user: req.user,
                loggedIn: loggedIn,
                isReSend: false,
                success: false,
                messages: null
              });
            }
          });
        } else {
          res.render('users/message', {
            user: user,
            loggedIn: loggedIn,
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
});

router.post('/', function (req, res, next) {
  var type = req.body.type;

  if(type == 'send-msg') {
    // SEND MESSAGE ==============================
    var message = req.body.textmessage;
  
    var subdomain = res.locals.subdomain;
    if (req.user || !res.locals.isMainDomain) {
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
              loggedIn: true,
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
  } else if (type == 'delete-msg') {
    // DELETE MESSAGE ==============================
    var messageId = req.body.id || req.query.id;
    var subdomain = res.locals.subdomain;

    if (req.user || !res.locals.isMainDomain) {
      Message.findOneAndRemove({ _id: messageId, username: subdomain }, function (err, message) {
        if (err) return res.json({ success: false, message: err });
        if (!message) return res.json({ success: false, message: "No data found to delete" });
        res.redirect('/');
      });
    }
  }
});

// LOGOUT ==============================
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
