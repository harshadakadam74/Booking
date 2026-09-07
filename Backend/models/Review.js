const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: false,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: false,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: false,
    },
    propertyName: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (photos) => photos.length <= 5,
        message: 'You can add up to 5 photos',
      },
    },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true, sparse: true });

const Review = mongoose.model('reviews', reviewSchema);
module.exports = Review;
