const express = require('express');
const router = express.Router();
const {
  getFeed,
  createPost,
  toggleLike,
  addComment,
  deletePost
} = require('../controllers/postController');
const { verifyToken, optionalToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', optionalToken, getFeed);
router.post('/', verifyToken, upload.single('image'), createPost);
router.post('/:id/like', verifyToken, toggleLike);
router.post('/:id/comment', verifyToken, addComment);
router.delete('/:id', verifyToken, deletePost);

module.exports = router;
