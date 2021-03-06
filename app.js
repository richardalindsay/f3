(function() {
  var api, app, blog, bodyParser, cookieParser, db, express, index, logger, mongo, path;

  express = require('express');

  path = require('path');

  logger = require('morgan');

  cookieParser = require('cookie-parser');

  bodyParser = require('body-parser');

  mongo = require('mongoskin');

  db = mongo.db("mongodb://localhost:27017/f3", {
    native_parser: true
  });

  index = require('./routes/index');

  blog = require('./routes/blog');

  api = require('./routes/api');

  app = express();

  app.set('views', path.join(__dirname, 'views'));

  app.set('view engine', 'jade');

  app.get('/partials/:name', function(req, res) {
    return res.render('partials/' + req.params.name);
  });

  app.use(logger('dev'));

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(cookieParser());

  app.use(express["static"](path.join(__dirname, 'public')));

  app.use(function(req, res, next) {
    req.db = db;
    return next();
  });

  app.use('/', index);

  app.use('/blog', blog);

  app.use('/api', api);

  app.use(function(req, res, next) {
    var err;
    err = new Error('Not Found');
    err.status = 404;
    return next(err);
  });

  if (app.get('env' === 'development')) {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      return res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    return res.render('error', {
      message: err.message,
      error: {}
    });
  });

  module.exports = app;

}).call(this);
