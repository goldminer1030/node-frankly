var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Message = require('../models/Message');

router.get('/', function (req, res) {
  var subdomain = res.locals.subdomain;
  var loggedIn = res.locals.login;
  
  console.log('res.locals.isMainDomain', res.locals.isMainDomain);
  console.log('res.locals.userid', res.locals.userid);
  console.log('subdomain', subdomain);
  
  if (res.locals.isMainDomain && !loggedIn) {
    // if main domain and not logged in
    res.render('index');
  } else {
    var filter = {
      'username': subdomain
    };
    if (res.locals.isMainDomain && loggedIn) {
      filter = {
        '_id': res.locals.userid
      };
    }
    
    User.findOne(filter, function (err, user) {
      if (!err && user) {
        console.log('findOne - user id: ', user._id);
        console.log('findOne - res.locals.userid: ', res.locals.userid);
        if ((res.locals.isMainDomain && loggedIn) || (!res.locals.isMainDomain && user._id == res.locals.userid)) {
          Message.find({ 'username': subdomain }).sort({ 'createdAt': -1 }).exec(function (err, message) {
            if (!err && message) {
              res.render('users/message', {
                user: user,
                loggedIn: true,
                isReSend: false,
                success: false,
                messages: message
              });
            } else {
              res.render('users/message', {
                user: user,
                loggedIn: true,
                isReSend: false,
                success: false,
                messages: null
              });
            }
          });
        } else {
          res.render('users/message', {
            user: user,
            loggedIn: false,
            isReSend: false,
            success: false,
            message: null
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
