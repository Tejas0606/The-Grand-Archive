const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, getGenres } = require('../controllers/bookController');
const { verifyToken, verifyAuthor } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/genres', getGenres);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', verifyToken, verifyAuthor, upload.single('coverImage'), createBook);

module.exports = router;
