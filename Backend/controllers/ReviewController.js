const Review = require('../models/Review');
const Product = require('../models/Product');
const ApiResponse = require('../Utils/ApiResponse');

const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) {
      return ApiResponse.error(res, 400, 'productId and rating are required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return ApiResponse.error(res, 404, 'Product not found');
    }

    const existingReview = await Review.findOne({ userId: req.user._id, productId });
    if (existingReview) {
      return ApiResponse.error(res, 400, 'You already submitted a review for this product');
    }

    const review = await Review.create({ userId: req.user._id, productId, rating, comment });
    return ApiResponse.success(res, { review }, 'Review created successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name email');
    return ApiResponse.success(res, { reviews }, 'Reviews loaded successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return ApiResponse.error(res, 404, 'Review not found');
    }
    if (review.userId.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 403, 'Not authorized to update this review');
    }

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();

    return ApiResponse.success(res, { review }, 'Review updated successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return ApiResponse.error(res, 404, 'Review not found');
    }
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return ApiResponse.error(res, 403, 'Not authorized to delete this review');
    }

    await review.remove();
    return ApiResponse.success(res, null, 'Review deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

module.exports = { createReview, getReviewsByProduct, updateReview, deleteReview };
