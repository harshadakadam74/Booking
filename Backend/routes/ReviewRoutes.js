const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { authenticate } = require('../middlewares/Authenticate');

router.post('/', authenticate, ReviewController.createReview);
router.get('/:productId', ReviewController.getReviewsByProduct);
router.put('/:id', authenticate, ReviewController.updateReview);
router.delete('/:id', authenticate, ReviewController.deleteReview);

module.exports = router;
