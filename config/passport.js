var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/User');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use('facebook-login',
  new FacebookStrategy({
    clientID: '503215930079850',
    clientSecret: '36a372af559a0b9f6dba8fdd6de17bf9',
    callbackURL: 'auth/facebook/callback',
    passReqToCallback: true,
  },
    function (req, accessToken, refreshToken, profile, done) {
      User.findOne({ id: profile.id }, (err, user) => {
        if (user) {
          return done(err, user);
        } // Login if account exists
        const newUser = new User({ // Create if not exists
          id: profile.id
        });
        newUser.save((user) => {
          return done(null, user); // Login after creting new
        });
      });
    }
  )
);

passport.use('local-login',
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true,
    passReqToCallback: true
  },
    function (req, email, password, done) {
      User.findOne({ 'email': email }, function (err, user) {
        if (err) return done(err);

        if (!user) {
          req.flash("email", req.body.email);
          return done(null, false, req.flash('loginError', 'No user found.'));
        }
        if (!user.authenticate(password)) {
          req.flash("email", req.body.email);
          return done(null, false, req.flash('loginError', 'Password does not Match.'));
        }
        req.flash('postsMessage', 'Welcome ' + user.nickname + '!');
        return done(null, user);
      });
    }
  )
);

module.exports = passport;
