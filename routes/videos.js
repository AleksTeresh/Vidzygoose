var express = require('express');
var router = express.Router();
var jwt = require('express-jwt')

var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
})

var ctrlVideos = require('../controllers/videos')

// var monk = require('monk');
// var db = monk('localhost:27017/vidzy');

router.get('/', ctrlVideos.fetchAll)

router.post('/', auth, ctrlVideos.create)

router.get('/:id', ctrlVideos.fetchOne)

router.put('/:id', auth, ctrlVideos.update)

router.delete('/:id', auth, ctrlVideos.delete)

module.exports = router;
