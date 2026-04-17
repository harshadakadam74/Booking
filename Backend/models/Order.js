const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    orderItems:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
    },
    ],
    orderDate: {
        type: Date,
        default: Date.now,
    },
    deliveryDate: {
        type: Date,
        default: null,
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addresss",
        required: true,
    },
    paymentDetails: {
        paymentMethod: { type: String, default: null },
        transationId: { type: String, default: null },
        paymentId: { type: String, default: null },
        paymentStatus: {
            type: String,
            enum: ["PENDING","SUCCESS","DAILED"],
            default: "PENDING",
        },
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    totalDiscountPrice: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ["PENDING","CONFIRMED","PLACED","SHIPPED","DELIVERED","CANCELLED"],
        default: "PENDING",
    },
    totalItem: {
        type: Number,
        required: true,
    },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order