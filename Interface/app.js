var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express();
  
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



app.use(session({
  secret: 'MapaRuasJWT',
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: true,
      secure: false
  }
}))

passport.use(new GoogleStrategy({ clientID: '878008747495-l2qc05267iast4gpr9oo0ovip2qisave.apps.googleusercontent.com',
                                  clientSecret: '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',
                                  callbackURL: '/login/google/callback'
                                },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// middleware function to intercepts all the requests and checks if is a image
app.use((req, res, next) => {
  const ext = path.extname(req.url);
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.gif') {
    express.static(path.join(__dirname, 'public'))(req, res, next);
  } else {
    next();
  }
});
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
