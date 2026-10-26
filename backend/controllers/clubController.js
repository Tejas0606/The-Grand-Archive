const ClubRoom = require('../models/ClubRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { emitNotification } = require('../socket/socketHandler');

// @desc    Get all club rooms & live AMAs
// @route   GET /api/clubs
// @access  Public
const getRooms = async (req, res) => {
  try {
    const { isAuthorAMA, bookId } = req.query;
    const query = {};

    if (isAuthorAMA !== undefined) {
      query.isAuthorAMA = isAuthorAMA === 'true';
    }

    if (bookId) {
      query.book = bookId;
    }

    const rooms = await ClubRoom.find(query)
      .populate('host', 'name username avatar role penName')
      .populate('book', 'title authorName coverImage')
      .populate('members', 'name username avatar role penName')
      .sort({ updatedAt: -1 });

    // Also get last message count or latest snippet for each room
    const enhancedRooms = await Promise.all(
      rooms.map(async (r) => {
        const messageCount = await Message.countDocuments({ room: r._id });
        const lastMessage = await Message.findOne({ room: r._id })
          .populate('sender', 'name username avatar role penName')
          .sort({ createdAt: -1 });

        return {
          ...r.toObject(),
          messageCount,
          lastMessage
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedRooms.length,
      rooms: enhancedRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve reading rooms: ${error.message}`
    });
  }
};

// @desc    Get single room details
// @route   GET /api/clubs/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await ClubRoom.findById(req.params.id)
      .populate('host', 'name username avatar role penName bio')
      .populate('book', 'title author authorName coverImage synopsis totalPages')
      .populate('members', 'name username avatar role penName');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Reading lounge not found in the archives.'
      });
    }

    res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error opening room: ${error.message}`
    });
  }
};

// @desc    Create a new reading club room or Author AMA
// @route   POST /api/clubs
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { name, description, bookId, isAuthorAMA, chapterScope } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'A name is required to open a reading parlor.'
      });
    }

    // Restriction: Only authors can start Official Author AMA
    const isAMA = Boolean(isAuthorAMA);
    if (isAMA && req.user.role !== 'author') {
      return res.status(403).json({
        success: false,
        message: 'Only verified authors can launch an Official Author AMA lounge.'
      });
    }

    const room = await ClubRoom.create({
      name,
      description: description || 'A tranquil parlor for discussing literature and philosophical inquiries.',
      book: bookId || null,
      host: req.user._id,
      isAuthorAMA: isAMA,
      chapterScope: chapterScope || 'Open Discussion • All Chapters Welcome',
      members: [req.user._id]
    });

    // If Author AMA, notify followers!
    if (isAMA) {
      const author = await User.findById(req.user._id);
      if (author.followers && author.followers.length > 0) {
        for (const followerId of author.followers) {
          const notif = await Notification.create({
            recipient: followerId,
            sender: req.user._id,
            type: 'author_ama',
            clubRoom: room._id
          });

          const popNotif = await Notification.findById(notif._id)
            .populate('sender', 'name username avatar role penName')
            .populate('clubRoom', 'name');

          emitNotification(followerId.toString(), popNotif);
        }
      }
    }

    const populatedRoom = await ClubRoom.findById(room._id)
      .populate('host', 'name username avatar role penName')
      .populate('book', 'title authorName coverImage')
      .populate('members', 'name username avatar role penName');

    res.status(201).json({
      success: true,
      message: isAMA ? 'Live Author AMA opened to the salon!' : 'Reading Club Room opened.',
      room: populatedRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create room: ${error.message}`
    });
  }
};

// @desc    Get message history for a club room
// @route   GET /api/clubs/:id/messages
// @access  Public
const getMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'name username avatar role penName')
      .sort({ createdAt: 1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch messages: ${error.message}`
    });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  getMessages
};
