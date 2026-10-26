const Post = require('../models/Post');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../config/cloudinary');
const { emitNotification } = require('../socket/socketHandler');

// @desc    Get literary feed with filters & pagination
// @route   GET /api/posts
// @access  Public (Optional auth for 'following' filter)
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { filter, bookId, username } = req.query;
    const query = {};

    if (bookId) {
      query.book = bookId;
    }

    if (username) {
      const userDoc = await User.findOne({ username: username.toLowerCase() });
      if (userDoc) {
        query.user = userDoc._id;
      }
    }

    if (filter === 'reviews') {
      query.postType = 'review';
    } else if (filter === 'quotes') {
      query.postType = 'quote';
    } else if (filter === 'announcements') {
      query.postType = 'author_announcement';
    } else if (filter === 'following' && req.user) {
      const currentUser = await User.findById(req.user._id);
      query.user = { $in: currentUser.following };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('user', 'name username avatar role penName')
      .populate('book', 'title author authorName coverImage')
      .populate('comments.user', 'name username avatar role penName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Compute authorResponded flag for each post
    const enhancedPosts = posts.map((p) => {
      const postObj = p.toObject();
      if (postObj.book && postObj.book.author) {
        const authorIdStr = postObj.book.author.toString();
        postObj.authorResponded = postObj.comments.some(
          (c) => c.user && c.user._id.toString() === authorIdStr
        );
      } else {
        postObj.authorResponded = false;
      }
      return postObj;
    });

    res.status(200).json({
      success: true,
      count: enhancedPosts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      posts: enhancedPosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch library feed: ${error.message}`
    });
  }
};

// @desc    Create a new post/review/quote
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { bookId, postType, content, rating, pageNumber, imageUrl } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot be empty.'
      });
    }

    // Role check for announcements
    if (postType === 'author_announcement' && req.user.role !== 'author') {
      return res.status(403).json({
        success: false,
        message: 'Only verified authors can dispatch official author announcements.'
      });
    }

    let finalImage = null;
    if (req.file) {
      finalImage = await uploadToCloudinary(req.file.buffer, 'grand_archive_posts');
    } else if (imageUrl) {
      finalImage = imageUrl;
    }

    const postData = {
      user: req.user._id,
      postType: postType || 'thought',
      content,
      image: finalImage
    };

    if (bookId) {
      postData.book = bookId;
    }

    if (rating && (postType === 'review' || !postType)) {
      postData.rating = Math.max(1, Math.min(5, Number(rating)));
    }

    if (pageNumber) {
      postData.pageNumber = Number(pageNumber);
    }

    const post = await Post.create(postData);

    // If review with rating, recalculate average rating for the book
    if (bookId && postData.rating) {
      const allBookReviews = await Post.find({ book: bookId, rating: { $ne: null } });
      const sum = allBookReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = (sum / allBookReviews.length).toFixed(1);

      await Book.findByIdAndUpdate(bookId, {
        averageRating: parseFloat(avg),
        ratingsCount: allBookReviews.length
      });
    }

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name username avatar role penName')
      .populate('book', 'title author authorName coverImage')
      .populate('comments.user', 'name username avatar role penName');

    res.status(201).json({
      success: true,
      message: 'Thought inscribed into the public ledger.',
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create post: ${error.message}`
    });
  }
};

// @desc    Toggle Like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const userIdStr = req.user._id.toString();
    const isLiked = post.likes.some((id) => id.toString() === userIdStr);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      post.likes.push(req.user._id);

      // Create notification if liking someone else's post
      if (post.user.toString() !== userIdStr) {
        const notif = await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });

        const popNotif = await Notification.findById(notif._id)
          .populate('sender', 'name username avatar role penName')
          .populate('post', 'content postType');

        emitNotification(post.user.toString(), popNotif);
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Like toggle failed: ${error.message}`
    });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.'
      });
    }

    const post = await Post.findById(req.params.id).populate('book', 'author');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    });

    await post.save();

    // Notify post owner if someone else commented
    if (post.user.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id
      });

      const popNotif = await Notification.findById(notif._id)
        .populate('sender', 'name username avatar role penName')
        .populate('post', 'content postType');

      emitNotification(post.user.toString(), popNotif);
    }

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name username avatar role penName')
      .populate('book', 'title author authorName coverImage')
      .populate('comments.user', 'name username avatar role penName');

    const postObj = updatedPost.toObject();
    if (postObj.book && postObj.book.author) {
      const authorIdStr = postObj.book.author.toString();
      postObj.authorResponded = postObj.comments.some(
        (c) => c.user && c.user._id.toString() === authorIdStr
      );
    }

    res.status(201).json({
      success: true,
      message: 'Annotation added to discussion.',
      post: postObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to add comment: ${error.message}`
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only purge your own entries from the ledger.'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post removed from archive.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Delete failed: ${error.message}`
    });
  }
};

module.exports = {
  getFeed,
  createPost,
  toggleLike,
  addComment,
  deletePost
};
