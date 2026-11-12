const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyName: { type: String, required: true, trim: true },
    roomTypeId: mongoose.Schema.Types.ObjectId,
    roomTypeName: { type: String, trim: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfGuests: { type: Number, required: true, min: 1 },
    numberOfRooms: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    pricePerNight: { type: Number, required: true, min: 0 },
    numberOfNights: { type: Number, required: true, min: 1 },
    specialRequests: { type: String, maxlength: 2000 },
    guestName: String,
    guestEmail: String,
    guestPhone: String,
    guestLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      capturedAt: Date,
    },
    billingAddress: {
      address: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      zipCode: { type: String, trim: true, maxlength: 10 },
      country: { type: String, trim: true, uppercase: true, minlength: 2, maxlength: 2 },
    },
    idempotencyKey: { type: String, maxlength: 128 },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFYING', 'COMPLETED', 'REFUND_PENDING', 'REFUNDED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    razorpayOrderId: String,
    razorpayOrder: mongoose.Schema.Types.Mixed,
    razorpayPaymentId: String,
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    lastError: String,
  },
  { timestamps: true }
);

paymentIntentSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);
paymentIntentSchema.index({ propertyId: 1, status: 1, expiresAt: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
