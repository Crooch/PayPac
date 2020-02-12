// inizializzazione moduli
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let passport = require('passport');
let expressValidator = require('express-validator');
let models = require('./models');

// inizializzazione endpoint
let autenticazioneRouter = require('./controllers/autenticazioneControl');
let contoRouter = require('./controllers/contoControl');
let pagamentiRouter = require('./controllers/pagamentiControl');

// inizializzazione express
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// sincronizzazione database
models.sequelize.sync();

// express setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// gestore sessioni
app.use(session({
	secret:'secret',
	saveUninitialized: true,
	resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// messaggi flash
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// endpoint
app.use('/', autenticazioneRouter);
app.use('/conto', contoRouter);
app.use('/pagamenti', pagamentiRouter);

// prende gli errori 404 e li manda al gestore errori
app.use(function(req, res, next) {
  next(createError(404));
});

// gestore errori
app.use(function (err, req, res, next) {
  // genera gli errori solo in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render della pagina di errore
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;