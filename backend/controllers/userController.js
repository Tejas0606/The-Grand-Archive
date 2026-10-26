const User = require('../models/User');
const Book = require('../models/Book');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../config/cloudinary');
const { emitNotification } = require('../socket/socketHandler');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .populate('readingShelf.book')
      .populate('followers', 'name username avatar role penName')
      .populate('following', 'name username avatar role penName');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member archive record not found.'
      });
    }

    // Also fetch their posts & reviews
    const posts = await Post.find({ user: user._id })
      .populate('user', 'name username avatar role penName')
      .populate('book', 'title authorName coverImage')
      .populate('comments.user', 'name username avatar role penName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user,
      posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch member dossier: ${error.message}`
    });
  }
};

// @desc    Toggle Follow / Unfollow
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow your own library register.'
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target member not found.'
      });
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId.toString()
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        following: false,
        followerCount: targetUser.followers.length,
        message: `Unfollowed ${targetUser.name}`
      });
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Create notification & emit real-time event
      const notification = await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow'
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name username avatar role penName');

      emitNotification(targetUserId.toString(), populatedNotification);

      return res.status(200).json({
        success: true,
        following: true,
        followerCount: targetUser.followers.length,
        message: `Now following ${targetUser.name}`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Follow toggle error: ${error.message}`
    });
  }
};

// @desc    Add or update book in user's reading shelf
// @route   POST /api/users/shelf
// @access  Private
const updateShelf = async (req, res) => {
  try {
    const { bookId, status, progressPage } = req.body;

    if (!bookId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and status (currently_reading, completed, want_to_read) are required.'
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in archive.'
      });
    }

    const user = await User.findById(req.user._id);
    const existingIndex = user.readingShelf.findIndex(
      (item) => item.book.toString() === bookId.toString()
    );

    let calculatedStatus = status;
    const pageNum = Number(progressPage) || 0;
    if (pageNum >= book.totalPages && book.totalPages > 0) {
      calculatedStatus = 'completed';
    }

    if (existingIndex > -1) {
      // Update existing item
      user.readingShelf[existingIndex].status = calculatedStatus;
      user.readingShelf[existingIndex].progressPage = Math.min(pageNum, book.totalPages);
      user.readingShelf[existingIndex].updatedAt = new Date();
    } else {
      // Add new shelf entry
      user.readingShelf.push({
        book: bookId,
        status: calculatedStatus,
        progressPage: Math.min(pageNum, book.totalPages),
        updatedAt: new Date()
      });
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('readingShelf.book');

    res.status(200).json({
      success: true,
      message: `Bookshelf updated: placed into ${calculatedStatus.replace('_', ' ')}.`,
      readingShelf: updatedUser.readingShelf
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Shelf update failed: ${error.message}`
    });
  }
};

// @desc    Remove book from reading shelf
// @route   DELETE /api/users/shelf/:bookId
// @access  Private
const removeFromShelf = async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);

    user.readingShelf = user.readingShelf.filter(
      (item) => item.book.toString() !== bookId.toString()
    );

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('readingShelf.book');

    res.status(200).json({
      success: true,
      message: 'Volume removed from your shelf.',
      readingShelf: updatedUser.readingShelf
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to remove from shelf: ${error.message}`
    });
  }
};

// @desc    Update user profile & avatar
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, penName, genreSpecialty, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (penName !== undefined) user.penName = penName;
    if (genreSpecialty !== undefined) user.genreSpecialty = genreSpecialty;

    // Handle avatar upload via Multer or direct URL
    if (req.file) {
      const uploadedAvatar = await uploadToCloudinary(req.file.buffer, 'grand_archive_avatars');
      user.avatar = uploadedAvatar;
    } else if (avatarUrl) {
      user.avatar = avatarUrl;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile records updated in library ledger.',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Profile update failed: ${error.message}`
    });
  }
};

// @desc    Get current user notifications
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatar role penName')
      .populate('post', 'content postType')
      .populate('book', 'title authorName coverImage')
      .populate('clubRoom', 'name')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch notifications: ${error.message}`
    });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Could not update notifications: ${error.message}`
    });
  }
};

module.exports = {
  getUserProfile,
  toggleFollow,
  updateShelf,
  removeFromShelf,
  updateProfile,
  getNotifications,
  markNotificationsRead
};
