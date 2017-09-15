var mongoose = require( 'mongoose' );

var videoSchema = new mongoose.Schema({
  title: { type: String, 'default': '', required: true },
  description: { type: String, 'default': '' }
});

var VideoModel = mongoose.model('video', videoSchema, 'videos');

module.exports = VideoModel;
