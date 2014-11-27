(function() {
  var express, router;

  express = require('express');

  router = express.Router();

  router.get('/', function(req, res) {
    return res.render('blog');
  });

  module.exports = router;

}).call(this);
