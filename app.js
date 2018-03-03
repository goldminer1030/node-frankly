// =======================
// get the packages we need ============
// =======================
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();

// Database
mongoose.connect('mongodb://root:2194zLn#8vl7@ds255258.mlab.com:55258/frankly-db');
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
app.use(flash());
app.use(session({ secret: 'MySecret', resave: true, saveUninitialized: false }));

// Passport
var passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', require('./routes/home'));
// app.use('/login', require('./routes/login'));
// app.use('/register', require('./routes/register'));

// Start Server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server On!');
});