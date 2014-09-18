var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/blog/:pageSize/:offset', function (req, res) {
    var db = req.db,
        pageSize = parseInt(req.params.pageSize, 10),
        offset = parseInt(req.params.offset, 10),
        count,
        posts;
    db.collection('posts').count(function (err, response) {
        count = response;
        next();
    });
    db.collection('posts').find({}, { title : 1, content: 1, date : 1 }).sort({ _id : -1 }).skip(offset).limit(pageSize).toArray(function (err, response) {
        posts = response;

        for(var i = 0, l = posts.length; i < l; i++) {
            if (!response[i].date) {
                response[i].date = response[i]._id.getTimestamp();
            }
        }

        next();
    });
    function next() {
        if (count && posts) {
            res.json({ data: 
                { "pagination" : { "rowCount" : count }, "posts" : posts }
            });
        }
    }
});

router.post('/post/', function (req, res) {
    var db = req.db;
    db.collection('posts').insert({ title : req.body.title, content : req.body.content }, function(err, response) {
        res.json(response);
    });
});

router.get('/post/:id/', function (req, res) {
    var db = req.db,
        id = req.params.id;
    db.collection('posts').findById(id, function(err, response) {
        res.json(response);
    });
});

router.put('/post/:id/', function (req, res) {
    var db = req.db,
        id = req.params.id;
    db.collection('posts').updateById(id, {'$set' : { title : req.body.title, content : req.body.content } }, function(err,response) {
        res.json(response);
    });
});

router.delete('/post/:id/', function (req, res) {
    var db = req.db,
        id = req.params.id;
    db.collection('posts').removeById(id, function(err, response) {
        res.json(response);
    });
});

module.exports = router;