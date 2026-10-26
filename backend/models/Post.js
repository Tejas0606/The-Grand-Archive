const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment cannot be empty'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null,
    index: true
  },
  postType: {
    type: String,
    enum: ['review', 'quote', 'thought', 'author_announcement'],
    default: 'thought',
    index: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  pageNumber: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema]
}, {
  timestamps: true
});

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
