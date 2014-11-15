var express = require('express');
var path = require('path');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')({ session: session });
var flash = require('express-flash');
var mongoose = require('mongoose');
var passport = require('passport');
var lusca = require('lusca');

var routes = require('./config/routes');
var secrets = require('./config/secrets');

var app = express();

/**
 * Connect to MongoDB.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});


/**
 * App configuration
 */

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

if (app.get('env') === 'development') {
  // don't minify html
  app.locals.pretty = true;

  // turn on console logging
  app.use(morgan('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.csrf());

app.use(function(req, res, next) {
  // Make user object available in templates.
  res.locals.user = req.user;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// routes setup
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

/**
 * Error handlers
 */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(errorhandler());
}

// production error handler
// no stacktraces leaked to user
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      title: 'Page not found',
      message: err.message
    });
  });
}

module.exports = app;
