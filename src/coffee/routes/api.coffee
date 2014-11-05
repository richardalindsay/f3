express = require 'express'
router = express.Router()

router.get '/blog/:pageSize/:offset/', (req, res) ->
    db = req.db
    pageSize = parseInt req.params.pageSize, 10
    offset = parseInt req.params.offset, 10
    db.bind 'posts'
    count = null
    posts = null
    
    db.posts.count (err, response) ->
        count = response
        next()

    db.posts.find {}, title: 1, content: 1, date: 1
    .sort _id : -1
    .skip offset
    .limit pageSize
    .toArray (err, response) ->
        posts = response
        i.date = i._id.getTimestamp() for i in posts when not i.date
        next()

    next = ->
        if count and posts
            res.json data: 
                "pagination":
                	"rowCount": count
                "posts": posts

router.post '/post/', (req, res) ->
    db = req.db
    db.bind 'posts'
    db.posts.insert title : req.body.title, content : req.body.content, (err, response) ->
        res.json response

router.get '/post/:id/', (req, res) ->
    db = req.db
    id = req.params.id
    db.bind 'posts'
    db.posts.findById id, (err, response) ->
        res.json response

router.put '/post/:id/', (req, res) ->
    db = req.db
    id = req.params.id
    db.bind 'posts'
    db.posts.updateById id, '$set': title: req.body.title, content: req.body.content, (err,response) ->
        res.json response

router.delete '/post/:id/', (req, res) ->
    db = req.db
    id = req.params.id
    db.bind 'posts'
    db.posts.removeById id, (err, response) ->
        res.json response

module.exports = router