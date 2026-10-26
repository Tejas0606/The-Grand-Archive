const express = require('express');
const router = express.Router();
const { polishReview, getCatchUp, getRecommendations } = require('../controllers/aiController');
const { optionalToken } = require('../middlewares/authMiddleware');

router.post('/polish-review', polishReview);
router.post('/catch-up', getCatchUp);
router.post('/recommend', optionalToken, getRecommendations);

module.exports = router;
