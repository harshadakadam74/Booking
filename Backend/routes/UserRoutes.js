const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
      default: null,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payments",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "DELIVERED"
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("orderitems", orderItemSchema);