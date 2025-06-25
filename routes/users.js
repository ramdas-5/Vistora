const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;



// Updated user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  profileImage: String,

  // Structured boards/pins with name and associated posts
  boards: [
    {
      name: { type: String, required: true },
      posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
    }
  ],

  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: { type: Date, default: Date.now }
});

// Plugin and passport setup
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
passport.use(new LocalStrategy(User.authenticate()));

module.exports = User;
