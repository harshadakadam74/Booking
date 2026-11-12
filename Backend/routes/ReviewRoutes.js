const express = require("express");
const router = express.Router();

const ReviewController = require("../controllers/ReviewController");
const { authenticate } = require("../middlewares/Authenticate");

// Public
router.get("/product/:productId", ReviewController.getReviewsByProduct);
router.get("/property/:propertyId", ReviewController.getReviewsByProperty);

// Authenticated User
router.post("/", authenticate, ReviewController.createReview);
router.post("/booking", authenticate, ReviewController.createBookingReview);
router.get("/booking/:bookingId", authenticate, ReviewController.getBookingReview);
router.put("/:id", authenticate, ReviewController.updateReview);
router.delete("/:id", authenticate, ReviewController.deleteReview);

module.exports = router;