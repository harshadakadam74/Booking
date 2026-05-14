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
        enum: ["CREDIT_CARD", "DEBIT_CARD", "RAZORPAY", "UPI"],
      },
      transactionId: String,
      paymentId: String,
      amount: Number,
    },
    specialRequests: String,
    guestName: String,
    guestEmail: String,
    guestPhone: String,
    cancellationReason: String,
    cancellationDate: Date,
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
