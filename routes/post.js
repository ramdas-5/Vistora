const mongoose = require('mongoose');

// --- Reply Schema ---
const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });  // includes createdAt & updatedAt

// --- Comment Schema ---
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  replies: [replySchema]
}, { timestamps: true });  // includes createdAt & updatedAt

// --- Post Schema ---
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String, // ✅ Cloudinary's internal ID for deletion
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema]
}, { timestamps: true });  // includes createdAt & updatedAt

// --- Export Post Model ---
const Post = mongoose.model('Post', postSchema);
module.exports = Post;
