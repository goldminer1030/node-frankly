var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/User');
var fs = require('fs');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use('local-login',
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true,
    passReqToCallback: true
  },
  function (req, email, password, done) {
    if (email)
      email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

    // asynchronous
    process.nextTick(function () {
      User.findOne({ 'email': email }, function (err, user) {
        // if there are any errors, return the error
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, {
             message: 'No user found.'
            });

        if (!user.authenticate(password))
          return done(null, false, {
            message: 'Oops! Wrong password.'
          });

        // all is well, return user
        else
          return done(null, user);
      });
    });
  })
);

passport.use('local-register',
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  },
  function (req, email, password, done) {
    if (email)
      email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
    
      var password_confirm = req.body.password_confirm;
      var username = req.body.username;

      if(password != password_confirm) {
        return done(null, false, {
          message: "Password does't match"
        });
      }
      
    // asynchronous
    process.nextTick(function () {
      // if the user is not already logged in:
      if (!req.user) {
        // check if link name exists already
        User.findOne({ 'username': username }, function (err, user) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, {
              message: 'That link is already taken.'
            });
          }
        });

        User.findOne({ 'email': email }, function (err, user) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, {
              message: 'That email is already taken.'
            });
          } else {

            if (req.file.path) {
              var tmp_path = req.file.path;
  
              /** The original name of the uploaded file
                  stored in the variable "originalname". **/
              var target_path = 'public/uploads/' + req.file.originalname;
              var real_path = '/uploads/' + req.file.originalname;
  
              /** A better way to copy the uploaded file. **/
              var src = fs.createReadStream(tmp_path);
              var dest = fs.createWriteStream(target_path);
              src.pipe(dest);
              src.on('error', function (err) { return done(err); });
              src.on('end', function () {
                // create the user
                var newUser = new User();
  
                newUser.fullname = req.body.name;
                newUser.email = email;
                newUser.password = password;
                newUser.picture = real_path;
                newUser.username = req.body.username;
  
                newUser.save(function (err) {
                  if (err)
                    return done(err);
  
                  return done(null, newUser, {
                    message: "Thank you for registration!"
                  });
                });
              });
            } else {
              // create the user
              var newUser = new User();
  
              newUser.fullname = req.body.name;
              newUser.email = email;
              newUser.password = password;
              newUser.picture = null;
              newUser.username = req.body.username;
  
              newUser.save(function (err) {
                if (err)
                  return done(err);
  
                return done(null, newUser, {
                  message: "Thank you for registration!"
                });
              });
            }
          }
        });

        // if the user is logged in but has no local account...
      } else if (!req.user.email) {
        // ...presumably they're trying to connect a local account
        // BUT let's check if the email used to connect a local account is being used by another user
        User.findOne({ 'email': email }, function (err, user) {
          if (err)
            return done(err);

          if (user) {
            return done(null, false, {
              message: 'That email is already taken.'
            });
          } else {
            var user = req.user;
            user.email = email;
            user.password = password;
            user.save(function (err) {
              if (err)
                return done(err);

              return done(null, user, {
                message: "Thank you for registration!"
              });
            });
          }
        });
      } else {
        // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
        return done(null, req.user);
      }

    });
  })
);

passport.use('facebook',
  new FacebookStrategy({
    clientID: '503215930079850',
    clientSecret: '36a372af559a0b9f6dba8fdd6de17bf9',
    callbackURL: 'https://evening-forest-79351.herokuapp.com/auth/facebook/callback',
    passReqToCallback: true,
  },
  function (req, accessToken, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function () {

      // check if the user is already logged in
      if (!req.user) {

        console.log(profile.email);
        User.findOne({ 'email': email }, function (err, user) {
          if (err)
            return done(err);

          if (user) {

            user.fullname = profile.name.givenName + ' ' + profile.name.familyName;
            user.email = email;

            user.save(function (err) {
              if (err)
                return done(err);

              return done(null, user);
            });
          } else {
            // if there is no user, create them
            var newUser = new User();

            newUser.fullname = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.username = profile.id;
            newUser.email = email;

            newUser.save(function (err) {
              if (err)
                return done(err);

              return done(null, newUser);
            });
          }
        });

      } else {
        // user already exists and is logged in, we have to link accounts
        var user = req.user; // pull the user out of the session

        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
        user.facebook.email = (profile.emails[0].value || '').toLowerCase();

        user.save(function (err) {
          if (err)
            return done(err);

          return done(null, user);
        });

      }
    });
  })
);

module.exports = passport;
