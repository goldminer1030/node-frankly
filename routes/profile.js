var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
var async = require('async');
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var upload = multer({ dest: 'uploads/' });

router.get('/', function (req, res) {
  if(req.user) {
    res.render('users/profile', {
      user: req.user,
      error: ''
    });
  } else {
    res.redirect("back");
  }
});

router.post('/', upload.single('img'), function (req, res) {
  if (!req.user) res.redirect('/');

  if (req.file) {
    // image upload
    var tmp_path = req.file.path;

    /** The original name of the uploaded file
        stored in the variable "originalname". **/
    var target_path = 'public/uploads/' + req.file.originalname;
    var real_path = '/uploads/' + req.file.originalname;

    /** A better way to copy the uploaded file. **/
    var src = fs.createReadStream(tmp_path);
    var dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    src.on('error', function (err) { return res.json({ success: "false", message: error }); });
    src.on('end', function () {
      // update user
      var user = req.user;
      user.picture = real_path;
      user.save(function (err) {
        if (err) {
          res.render('users/profile', {
            user: req.user,
            error: "An error occured while updating picture, please try again"
          });
        }

        res.redirect('/');
      });
    });
    
  } else {
    var current_user = req.user;
    if (current_user.authenticate(req.body.currentPassword)) {
      var user = current_user;
      user.password = req.body.newPassword;
      user.fullname = req.body.fullname;
      user.save(function (err) {
        if (err) {
          res.render('users/profile', {
            user: req.user,
            error: "An error ocurred while updating user information"
          });
        }

        res.redirect('/');
      });
    } else {
      res.render('users/profile', {
        user: req.user,
        error: "Invalid current password"
      });
    }
  }
});

module.exports = router;