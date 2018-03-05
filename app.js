// =======================
// get the packages we need ============
// =======================
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

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
  secret: 'MySecret',
  resave: false,
  saveUninitialized: true
}));

// Passport
var passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  next();
});
app.use('/', require('./routes/home'));
app.use('/privacy', require('./routes/privacy'));
app.use('/terms', require('./routes/terms'));
app.use('/login', require('./routes/login'));
app.use('/reset_password', require('./routes/reset_password'));
app.use('/register', require('./routes/register'));

function isAuthenticated(req, res, next) {
  if (req.user) {
    return true;
  } else {
    return false;
  }
}

// Start Server
var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
  console.log("Express is working on port " + port);
});