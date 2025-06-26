const express = require('express');
const router = express.Router();
const passport = require('passport');
const userModel = require('./users');
const postModel = require('./post');
const upload = require('./multer');
const path = require('path');
const fs = require('fs');


// Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// --- Auth Routes ---
router.get('/', (req, res) => {
  res.render('landing', {
    user: req.user || null, // pass user if logged in
    navbar: true
  });
});


router.get('/register', (_, res) => res.render('register', { navbar: false }));
router.get('/login', (_, res) => res.render('index', { navbar: false }));

router.post('/register', async (req, res) => {
  try {
    const { username, name, email, contact, password } = req.body;
    const user = new userModel({ username, name, email, contact });
    await userModel.register(user, password);
    passport.authenticate('local')(req, res, () => res.redirect('/profile'));
  } catch (err) {
    console.error(err);
    res.redirect('/register');
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
}));

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // optional: removes cookie
      res.redirect('/');
    });
  });
});


// --- Profile Routes ---
router.get('/profile', isLoggedIn, async (req, res) => {
  const user = await userModel
    .findById(req.user._id)
    .populate('posts')
    .populate('boards.posts');
  res.render('profile', { user, navbar: true });
});


router.get('/profile/:username', async (req, res) => {
  const user = await userModel.findOne({ username: req.params.username }).populate('posts').populate('boards.posts');
  if (!user) return res.status(404).send("User not found");
  res.render('userProfile', { user, navbar: true });
});

router.get('/edit', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  res.render('editProfile', { user, navbar: true });
});

router.post('/edit', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  user.name = req.body.name;
  user.username = req.body.username;
  user.contact = req.body.contact;
  await user.save();
  await req.logout();
  res.redirect('/login');
});

router.post('/fileupload', isLoggedIn, upload.single('image'), async (req, res) => {
  const user = await userModel.findById(req.user._id);
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

// --- Feed ---
router.get('/feed', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  
  const sortBy = req.query.sort === 'oldest' ? 1 : -1;
  const posts = await postModel.find()
    .populate('user')
    .sort({ createdAt: sortBy });

  res.render('feed', {
    user,
    posts,
    navbar: true,
    selectedSort: req.query.sort || 'newest'  // ✅ correct variable name
  });
});




router.get('/show/posts', isLoggedIn, async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate({
        path: 'posts',
        populate: { path: 'user', select: 'username' }
      });

    res.render('show', { posts: user.posts, user, navbar: true });
  } catch (err) {
    console.error("Error loading your posts:", err);
    res.status(500).send("Error loading posts");
  }
});



// --- Post Detail ---
router.get('/show/post/:id', isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id)
      .populate('user', 'username')
      .populate('likes', 'username')
      .populate('comments.user', 'username')
      .populate('comments.replies.user', 'username');

    if (!post) return res.status(404).send("Post not found");

    const user = await userModel.findById(req.user._id);
    res.render('postDetail', { post, user, navbar: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// --- Create Post ---
router.get('/add', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  res.render('add', { user, navbar: true });
});

router.post('/createpost', isLoggedIn, upload.single('postimage'), async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).send('User not found');

    if (!req.file || !req.file.path) {
      return res.status(400).send('Image not uploaded');
    }

    // ✅ Save Cloudinary image URL
    const post = new postModel({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.path // Cloudinary returns full URL here
    });

    await post.save();
    user.posts.push(post._id);

    // ✅ Handle pin/board logic
    const pinName = req.body.newPin || req.body.existingPin;
    if (pinName) {
      const board = user.boards.find(b => b.name === pinName);
      if (board) {
        board.posts.push(post._id);
      } else {
        user.boards.push({ name: pinName, posts: [post._id] });
      }
    }

    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/deletepinpost/:pinName/:postId', isLoggedIn, async (req, res) => {
  const { pinName, postId } = req.params;

  try {
    const user = await userModel.findById(req.user._id).populate('posts');

    const board = user.boards.find(b => b.name === pinName);
    if (!board) return res.status(404).send("Pin not found");

    // 1. Remove the post from this specific pin
    board.posts = board.posts.filter(p => p.toString() !== postId);

    // 2. Check if this post exists in any other pins or in user.posts
    const isStillReferenced = user.boards.some(b =>
      b.posts.some(p => p.toString() === postId)
    ) || user.posts.some(p => p.toString() === postId);

    if (!isStillReferenced) {
      // Remove the post from MongoDB and delete image
      const post = await postModel.findByIdAndDelete(postId);

      if (post && post.image) {
        const imagePath = path.join(__dirname, '../public/images/uploads', post.image);
        fs.unlink(imagePath, err => {
          if (err) console.error('Failed to delete image:', err);
        });
      }
    }

    // 3. Save user after modification
    await user.save();

    res.redirect(`/show/pin/${user.boards.findIndex(b => b.name === pinName)}`);
  } catch (err) {
    console.error("Error deleting post from pin:", err);
    res.status(500).send("Server error");
  }
});




router.post('/deletepost/:id', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  user.posts.pull(req.params.id);
  user.boards.forEach(b => {
    b.posts = b.posts.filter(p => p.toString() !== req.params.id);
  });
  await user.save();
  await postModel.findByIdAndDelete(req.params.id);
  res.redirect('/profile');
});

// --- Pin Routes ---
router.get('/show/pin/:index', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id).populate('boards.posts');
  const board = user.boards[req.params.index];
  if (!board) return res.status(404).send("Board not found");
  res.render('pinPosts', { board, navbar: true });
});

router.post('/editpinname/:oldName', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  const board = user.boards.find(b => b.name === req.params.oldName);
  if (board) board.name = req.body.newName;
  await user.save();
  const index = user.boards.findIndex(b => b.name === req.body.newName);
  res.redirect(`/show/pin/${index}`);
});

router.post('/deletepin/:pinName', isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id);
  user.boards = user.boards.filter(b => b.name !== req.params.pinName);
  await user.save();
  res.redirect('/profile');
});

// --- Likes ---
router.post('/like/:postId', isLoggedIn, async (req, res) => {
  const post = await postModel.findById(req.params.postId);
  const userId = req.user._id;
  post.likes.includes(userId) ? post.likes.pull(userId) : post.likes.push(userId);
  await post.save();
  res.redirect('back');
});

// --- Comments ---
router.post('/comment/:postId', isLoggedIn, async (req, res) => {
  const post = await postModel.findById(req.params.postId);
  post.comments.push({ user: req.user._id, text: req.body.text });
  await post.save();
  res.redirect('back');
});

router.post('/edit-comment/:postId/:commentId', isLoggedIn, async (req, res) => {
  const post = await postModel.findById(req.params.postId);
  const comment = post.comments.id(req.params.commentId);
  if (comment && comment.user.equals(req.user._id)) {
    comment.text = req.body.text;
    comment.edited = true;
    await post.save();
    res.redirect('back');
  } else {
    res.status(403).send("Unauthorized edit attempt.");
  }
});

router.post('/delete-comment/:postId/:commentId', isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);

    if (!comment) return res.status(404).send('Comment not found');
    if (!comment.user.equals(req.user._id)) return res.status(403).send('Unauthorized');

    comment.deleteOne(); // Properly deletes the subdocument
    await post.save();

    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/reply-comment/:postId/:commentId', isLoggedIn, async (req, res) => {
  const post = await postModel.findById(req.params.postId);
  const comment = post.comments.id(req.params.commentId);

  if (comment) {
    comment.replies.push({
      user: req.user._id,
      text: req.body.text,
      createdAt: new Date()
    });
    await post.save();
    res.redirect('back');
  } else {
    res.status(404).send("Comment not found");
  }
});

module.exports = router;
