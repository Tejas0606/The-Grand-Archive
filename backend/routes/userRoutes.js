const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  toggleFollow,
  updateShelf,
  removeFromShelf,
  updateProfile,
  getNotifications,
  markNotificationsRead
} = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/notifications', verifyToken, getNotifications);
router.put('/notifications/read', verifyToken, markNotificationsRead);
router.post('/shelf', verifyToken, updateShelf);
router.delete('/shelf/:bookId', verifyToken, removeFromShelf);
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);
router.post('/:id/follow', verifyToken, toggleFollow);
router.get('/:username', getUserProfile);

module.exports = router;
