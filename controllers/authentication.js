var passport = require('passport')
var mongoose = require('mongoose')

var commonUtils = require('./common')

var User = mongoose.model('User')

var sendJSONresponse = commonUtils.sendJSONresponse

module.exports.register = function (req, res) {
  if (!req.body.name || !req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      message: 'All fields required.'
    })

    return
  }

  var user = new User()
  user.name = req.body.name
  user.email = req.body.email
  user.setPassword(req.body.password)

  user.save(function (err) {
    if (err) {
      sendJSONresponse(res, 404, err)
    } else {
      var token = user.generateJwt()
      sendJSONresponse(res, 200, {
        'token': token
      })
    }
  })
}

module.exports.login = function (req, res) {
  if (!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      message: 'All fields required.'
    })

    return
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) {
      sendJSONresponse(res, 404, err)
      return
    }

    if (user) {
      token = user.generateJwt()
      sendJSONresponse(res, 200, {
        'token': token
      })
    } else {
      sendJSONresponse(res, 401, info)
    }
  })(req, res)
}
