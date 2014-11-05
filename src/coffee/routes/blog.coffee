express = require 'express'
router = express.Router()

router.get '/', (req, res) ->
    res.render 'blog'

module.exports = router