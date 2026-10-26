const Book = require('../models/Book');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../config/cloudinary');
const { emitNotification } = require('../socket/socketHandler');

// @desc    Get all books with pagination, search, genre filter
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const { search, genre, sort, author } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
        { synopsis: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    if (author) {
      query.author = author;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'rating') {
      sortOptions = { averageRating: -1, ratingsCount: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    } else if (sort === 'year') {
      sortOptions = { publishedYear: -1 };
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('author', 'name username avatar penName role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve books from catalog: ${error.message}`
    });
  }
};

// @desc    Get single book details by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author', 'name username avatar penName bio role followers');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in the Grand Archive.'
      });
    }

    // Fetch reviews specifically for this book
    const reviews = await Post.find({ book: book._id, postType: 'review' })
      .populate('user', 'name username avatar role penName')
      .populate('comments.user', 'name username avatar role penName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      book,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to inspect volume: ${error.message}`
    });
  }
};

// @desc    Publish a new book (Author only)
// @route   POST /api/books
// @access  Private (Author)
const createBook = async (req, res) => {
  try {
    const { title, synopsis, genre, totalPages, isbn, publishedYear, coverImageUrl } = req.body;

    if (!title || !synopsis || !genre) {
      return res.status(400).json({
        success: false,
        message: 'Title, synopsis, and genre are required to inscribe a book into the archive.'
      });
    }

    let finalCoverImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800';

    if (req.file) {
      finalCoverImage = await uploadToCloudinary(req.file.buffer, 'grand_archive_books');
    } else if (coverImageUrl) {
      finalCoverImage = coverImageUrl;
    }

    const authorUser = await User.findById(req.user._id);

    const newBook = await Book.create({
      title,
      author: req.user._id,
      authorName: authorUser.penName || authorUser.name,
      coverImage: finalCoverImage,
      synopsis,
      genre,
      totalPages: Number(totalPages) || 300,
      isbn: isbn || '',
      publishedYear: Number(publishedYear) || new Date().getFullYear()
    });

    // Notify all followers of this author
    if (authorUser.followers && authorUser.followers.length > 0) {
      for (const followerId of authorUser.followers) {
        const notif = await Notification.create({
          recipient: followerId,
          sender: req.user._id,
          type: 'new_book',
          book: newBook._id
        });

        const popNotif = await Notification.findById(notif._id)
          .populate('sender', 'name username avatar role penName')
          .populate('book', 'title authorName coverImage');

        emitNotification(followerId.toString(), popNotif);
      }
    }

    res.status(201).json({
      success: true,
      message: `"${newBook.title}" successfully inscribed into the Grand Archive!`,
      book: newBook
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Book publication failed: ${error.message}`
    });
  }
};

// @desc    Get all distinct genres
// @route   GET /api/books/genres
// @access  Public
const getGenres = async (req, res) => {
  try {
    const genres = await Book.distinct('genre');
    res.status(200).json({
      success: true,
      genres: genres.filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch genres: ${error.message}`
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  getGenres
};
