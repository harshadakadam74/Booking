const express = require("express");
const router = express.Router();

const ReviewController = require("../controllers/ReviewController");
const { authenticate } = require("../middlewares/Authenticate");

// Public
router.get("/product/:productId", ReviewController.getReviewsByProduct);

// Authenticated User
router.post("/", authenticate, ReviewController.createReview);
router.put("/:id", authenticate, ReviewController.updateReview);
router.delete("/:id", authenticate, ReviewController.deleteReview);

module.exports = router;