(function() {
  var express, router;

  express = require('express');

  router = express.Router();

  router.get('/blog/:pageSize/:offset/', function(req, res) {
    var count, db, next, offset, pageSize, posts;
    db = req.db;
    pageSize = parseInt(req.params.pageSize, 10);
    offset = parseInt(req.params.offset, 10);
    db.bind('posts');
    count = null;
    posts = null;
    db.posts.count(function(err, response) {
      count = response;
      return next();
    });
    db.posts.find({}, {
      title: 1,
      content: 1,
      date: 1
    }).sort({
      _id: -1
    }).skip(offset).limit(pageSize).toArray(function(err, response) {
      var i, _i, _len;
      posts = response;
      for (_i = 0, _len = posts.length; _i < _len; _i++) {
        i = posts[_i];
        if (!i.date) {
          i.date = i._id.getTimestamp();
        }
      }
      return next();
    });
    return next = function() {
      if (count && posts) {
        return res.json({
          data: {
            "pagination": {
              "rowCount": count
            },
            "posts": posts
          }
        });
      }
    };
  });

  router.post('/post/', function(req, res) {
    var db;
    db = req.db;
    db.bind('posts');
    return db.posts.insert({
      title: req.body.title,
      content: req.body.content
    }, function(err, response) {
      return res.json(response);
    });
  });

  router.get('/post/:id/', function(req, res) {
    var db, id;
    db = req.db;
    id = req.params.id;
    db.bind('posts');
    return db.posts.findById(id, function(err, response) {
      return res.json(response);
    });
  });

  router.put('/post/:id/', function(req, res) {
    var db, id;
    db = req.db;
    id = req.params.id;
    db.bind('posts');
    return db.posts.updateById(id, {
      '$set': {
        title: req.body.title,
        content: req.body.content
      }
    }, function(err, response) {
      return res.json(response);
    });
  });

  router["delete"]('/post/:id/', function(req, res) {
    var db, id;
    db = req.db;
    id = req.params.id;
    db.bind('posts');
    return db.posts.removeById(id, function(err, response) {
      return res.json(response);
    });
  });

  module.exports = router;

}).call(this);
