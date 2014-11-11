express = require 'express'
path = require 'path'
logger = require 'morgan'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'

# Database
mongo = require 'mongoskin'
db = mongo.db "mongodb://localhost:27017/f3", native_parser : true

index = require './routes/index'
blog = require './routes/blog'
api = require './routes/api'

app = express()
#view engine setup
app.set 'views', path.join __dirname, 'views'
app.set 'view engine', 'jade'

app.get '/partials/:name', (req, res) ->
    res.render 'partials/' + req.params.name

app.use logger 'dev'
app.use bodyParser.json()
app.use bodyParser.urlencoded extended: true
app.use cookieParser()
app.use express.static path.join __dirname, 'public'

# Make our db accessible to our router
app.use (req, res, next) ->
    req.db = db
    next()

app.use '/', index
app.use '/blog', blog
app.use '/api', api

# catch 404 and forward to error handler
app.use (req, res, next) ->
    err = new Error 'Not Found'
    err.status = 404
    next(err)

# error handlers

# development error handler
# will print stacktrace
if app.get 'env' is 'development'
    app.use (err, req, res, next) ->
        res.status err.status or 500
        res.render 'error',
            message: err.message
            error: err

# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next) ->
    res.status err.status or 500
    res.render 'error',
        message: err.message
        error: {}

module.exports = app
