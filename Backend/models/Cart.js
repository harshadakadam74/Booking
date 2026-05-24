const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  totalPayable: {
    type: Number,
    default: 0,
  },
  totalItem: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;
