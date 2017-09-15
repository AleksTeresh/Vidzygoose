var mongoose = require('mongoose')

var commonUtils = require('./common')

var User = mongoose.model('User')

var sendJSONresponse = commonUtils.sendJSONresponse

var VideoModel = require('../modules/videos')
var User = mongoose.model('User')

var getAuthor = function (req, res, callback) {
  if (req.payload && req.payload.email) {
    User
      .findOne({ email: req.payload.email })
      .exec(function (err, user) {
        if (!user) {
          sendJSONresponse(res, 404, {
            message: 'User not found'
          })
          return
        } else if (err) {
          console.error(err)
          sendJSONresponse(res, 404, err)
          return
        }

        callback(req, res, user.name)
      })
  } else {
    sendJSONresponse(res, 404, {
      message: 'User not found'
    })
  }
}

module.exports.create = function(req, res) {
  getAuthor(req, res, function (req, res, userName) {
    VideoModel.create({
      title: req.body.title,
      description: req.body.description + ' (added by ' + userName + ' )'
    }, function(err, video) {
      if (err) throw err;

      res.json(video);
    })
  })
}

module.exports.fetchAll = function(req, res) {
  VideoModel.find({}, function(err, videos){
      if (err) throw err;
    	res.json(videos);
  });
}

module.exports.fetchOne = function(req, res) {
  VideoModel.findOne({ _id: req.params.id }, function(err, videos){
      if (err) throw err;
      res.json(videos);
  });
}

module.exports.update = function(req, res) {
  // var collection = db.get('videos');
  VideoModel.findOneAndUpdate({
      _id: req.params.id
  },
  {
      title: req.body.title,
      description: req.body.description
  }, function(err, video){
      if (err) throw err;

      res.json(video);
  });
}

module.exports.delete = function(req, res) {
  VideoModel.remove({
      _id: req.params.id
  }, function(err, video){
      if (err) throw err;

      res.json(video);
  });
}
