const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    property: {
      type: String,
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    roomTypeName: {
      type: String,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      maxlength: 128,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    numberOfNights: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentDetails: {
      paymentMethod: {
        type: String,
        enum: ["CREDIT_CARD", "DEBIT_CARD", "RAZORPAY", "UPI", "DUMMY"],
      },
      transactionId: String,
      paymentId: String,
      amount: Number,
    },
    paymentOrderLock: {
      token: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },
    specialRequests: String,
    guestName: String,
    guestEmail: String,
    guestPhone: String,
    billingAddress: {
      address: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      zipCode: { type: String, trim: true, maxlength: 10 },
      country: { type: String, trim: true, uppercase: true, minlength: 2, maxlength: 2 },
    },
    guestLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      capturedAt: Date,
    },
    cancellationReason: String,
    cancellationDate: Date,
  },
  { timestamps: true }
);

bookingSchema.index({ propertyId: 1, bookingStatus: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ property: 1, bookingStatus: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
