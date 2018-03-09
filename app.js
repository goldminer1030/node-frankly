// =======================
// get the packages we need ============
// =======================
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var flash = require('express-flash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Redis = require('ioredis');
var redis = new Redis(6379, '127.0.0.1');

var app = express();

// Database
mongoose.connect('mongodb://root:rootroot@ds135624.mlab.com:35624/frankly-db');
var db = mongoose.connection;
db.once("open", function () {
  console.log("DB connected!");
});
db.on("error", function (err) {
  console.log("DB ERROR :", err);
});

// View Engine
app.set('views', __dirname + '/views');
app.set("view engine", 'ejs');

// ejs-layouts setting
app.set('layout', 'layout'); // set views/layout.ejs as main layout
app.set("layout extractScripts", true); // extract scripts from rendered HTML, <%- script %> in layout.ejs file
app.use(expressLayouts); // render index.ejs file

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  store: new redisStore({
    host: '127.0.0.1',
    port: 6379
  }),
  secret: 'user_sid',
  resave: true,
  saveUninitialized: true
}));

// Passport
var passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
app.use(function (req, res, next) {
  var login = false;
  var domain = req.get('host').match(/\w+/);
  var mainDomain = "";
  var subdomain = "";
  var isMainDomain = false;

  if (domain) {
    subdomain = domain[0];
    if (!req.user && (subdomain == 'www' || subdomain == 'localhost' || subdomain == 'wearehighlyeffective')) {
      isMainDomain = true;
    }
  }

  if (req.user) {
    login = true;

    redis.set("username", req.user.username, function (err) {
      if (err) {
        // Something went wrong
        console.error("error");
      }
    });
  }

  console.log('session', req.session);
  res.locals.isMainDomain = isMainDomain;
  res.locals.subdomain = subdomain;
  res.locals.login = login;
  res.locals.username = "";
  res.locals.showProfile = login;

  redis.get("username", function (err, value) {
    if (err) {
      console.error("error while getting from req.redis");
    } else {
      res.locals.username = value;
      res.locals.login = true;
      
      if (isMainDomain) {
        res.locals.showProfile = true;
      } else {
        if (subdomain == value) {
          res.locals.showProfile = true;
        }
      }
    }
    
    req.redis = redis;
    next();
  });

});

app.use('/', require('./routes/home'));
app.use('/profile', require('./routes/profile'));
app.use('/privacy', require('./routes/privacy'));
app.use('/terms', require('./routes/terms'));
app.use('/login', require('./routes/login'));
app.use('/forgot', require('./routes/forgot'));
app.use('/reset', require('./routes/reset'));
app.use('/register', require('./routes/register'));

// send to facebook to do the authentication
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  })
);

// Start Server
var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
  console.log("Express is working on port " + port);
});