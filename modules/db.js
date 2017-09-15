var mongoose = require('mongoose')
require('./videos')
require('./users')

var dbURI = 'mongodb://localhost:27017/vidzy'
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI
}
mongoose.connect(dbURI)

var gracefulShutdown = function (msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};

process.once('SIGUSR2', function () {
  gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', function () {
  gracefulShutdown('app termination', function () {
    process.exit(0);
  });
});

process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function () {
    process.exit(0);
  });
});
