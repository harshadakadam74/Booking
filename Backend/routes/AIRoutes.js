const express = require('express');
const AIController = require('../controllers/AIController');
const aiRateLimit = require('../middlewares/aiRateLimit');
const { authenticate } = require('../middlewares/Authenticate');
const { admin } = require('../middlewares/AdminMiddleware');

const router = express.Router();

router.use(aiRateLimit);
router.post('/chat', AIController.chat);
router.get('/conversations', authenticate, AIController.listConversations);
router.post('/conversations', authenticate, AIController.createConversation);
router.get('/conversations/:conversationId', authenticate, AIController.getConversation);
router.put('/conversations/:conversationId', authenticate, AIController.updateConversation);
router.delete('/conversations/:conversationId', authenticate, AIController.deleteConversation);
router.post('/smart-search', AIController.smartSearch);
router.post('/recommendations', AIController.recommendHotels);
router.post('/plan-trip', AIController.planTrip);
router.get('/trip-plans', authenticate, AIController.listTripPlans);
router.post('/trip-plans', authenticate, AIController.createTripPlan);
router.get('/trip-plans/:planId', authenticate, AIController.getTripPlan);
router.put('/trip-plans/:planId', authenticate, AIController.updateTripPlan);
router.delete('/trip-plans/:planId', authenticate, AIController.deleteTripPlan);
router.get('/reviews/:hotelId/summary', AIController.summarizeReviews);
router.get('/admin/overview', authenticate, admin, AIController.adminOverview);
router.post('/admin/insights', authenticate, admin, AIController.adminOverview);

module.exports = router;
