const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide the book title'],
    trim: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: [true, 'Please provide author pen name or full name'],
    trim: true
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
  },
  synopsis: {
    type: String,
    required: [true, 'Please provide a book synopsis']
  },
  genre: {
    type: String,
    required: [true, 'Please select a genre'],
    index: true
  },
  totalPages: {
    type: Number,
    required: [true, 'Please provide total pages count'],
    default: 320
  },
  isbn: {
    type: String,
    default: ''
  },
  publishedYear: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Composite index for fast searching and filtering
bookSchema.index({ title: 'text', synopsis: 'text', authorName: 'text' });

module.exports = mongoose.model('Book', bookSchema);
