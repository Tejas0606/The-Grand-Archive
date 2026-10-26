const express = require('express');
const router = express.Router();
const { getRooms, getRoomById, createRoom, getMessages } = require('../controllers/clubController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.get('/:id/messages', getMessages);
router.post('/', verifyToken, createRoom);

module.exports = router;
