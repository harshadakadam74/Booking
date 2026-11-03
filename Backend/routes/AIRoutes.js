const express = require('express');
const AIController = require('../controllers/AIController');
const aiRateLimit = require('../middlewares/aiRateLimit');
const { authenticate } = require('../middlewares/Authenticate');
const { admin } = require('../middlewares/AdminMiddleware');

const router = express.Router();

router.use(aiRateLimit);
router.post('/chat', AIController.chat);
router.post('/recommendations', AIController.recommendHotels);
router.post('/plan-trip', AIController.planTrip);
router.get('/reviews/:hotelId/summary', AIController.summarizeReviews);
router.get('/admin/overview', authenticate, admin, AIController.adminOverview);

module.exports = router;
