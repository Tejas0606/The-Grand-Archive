const mongoose = require('mongoose');

const clubRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a club room name'],
    trim: true
  },
  description: {
    type: String,
    default: 'A tranquil parlor for discussing literature, character arcs, and philosophical inquiries.'
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAuthorAMA: {
    type: Boolean,
    default: false
  },
  chapterScope: {
    type: String,
    default: 'Open Discussion • All Chapters Welcome'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ClubRoom', clubRoomSchema);
