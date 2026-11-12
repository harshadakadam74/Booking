const Review = require('../models/Review');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
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

const createBookingReview = async (req, res) => {
  try {
    const { bookingId, rating, comment = '', photos = [] } = req.body;
    const numericRating = Number(rating);

    if (!bookingId || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return ApiResponse.error(res, 400, 'bookingId and a rating from 1 to 5 are required');
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return ApiResponse.error(res, 404, 'Booking not found');
    if (booking.bookingStatus === 'CANCELLED') {
      return ApiResponse.error(res, 400, 'Cancelled bookings cannot be reviewed');
    }

    const checkoutPassed = booking.checkOutDate && new Date(booking.checkOutDate) <= new Date();
    if (booking.bookingStatus !== 'COMPLETED' && !checkoutPassed) {
      return ApiResponse.error(res, 400, 'You can review this stay after checkout');
    }

    const existingReview = await Review.findOne({ userId: req.user._id, bookingId });
    if (existingReview) return ApiResponse.error(res, 409, 'You already reviewed this booking');

    const safePhotos = Array.isArray(photos)
      ? photos.filter((photo) => typeof photo === 'string' && photo.trim()).slice(0, 5)
      : [];

    const review = await Review.create({
      userId: req.user._id,
      bookingId: booking._id,
      propertyId: booking.propertyId,
      propertyName: booking.property,
      rating: numericRating,
      comment: String(comment).trim().slice(0, 2000),
      photos: safePhotos,
    });

    return ApiResponse.success(res, { review }, 'Review submitted successfully', 201);
  } catch (error) {
    return ApiResponse.error(res, error.code === 11000 ? 409 : 400, error.message);
  }
};

const getBookingReview = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user._id });
    if (!booking) return ApiResponse.error(res, 404, 'Booking not found');

    const review = await Review.findOne({ bookingId: booking._id });
    return ApiResponse.success(res, { review }, 'Booking review loaded successfully');
  } catch (error) {
    return ApiResponse.error(res, 400, error.message);
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

const getReviewsByProperty = async (req, res) => {
  const { propertyId } = req.params;
  if (!/^[a-f\d]{24}$/i.test(propertyId) || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return ApiResponse.error(res, 400, 'A valid hotel ID is required');
  }
  try {
    const reviews = await Review.find({ propertyId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return ApiResponse.success(res, { reviews }, 'Hotel reviews loaded successfully');
  } catch (error) {
    console.error('Hotel reviews could not be loaded:', error.message);
    return ApiResponse.error(res, 500, 'Unable to load hotel reviews');
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

module.exports = {
  createReview,
  createBookingReview,
  getBookingReview,
  getReviewsByProduct,
  getReviewsByProperty,
  updateReview,
  deleteReview,
};
