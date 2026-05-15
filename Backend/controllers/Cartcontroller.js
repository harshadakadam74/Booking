const Cart = require('../models/Cart');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.room?.price || item.price || 0;
    const quantity = item.quantity || 1;
    return total + price * quantity;
  }, 0);
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.hotel')
      .populate('items.room');

    res.json(cart || { items: [], totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch cart', error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { hotelId, roomId, quantity = 1 } = req.body;

    const room = await Room.findById(roomId);
    const hotel = await Hotel.findById(hotelId);
    if (!room || !hotel) return res.status(404).json({ message: 'Hotel or room not found' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.room.toString() === roomId.toString()
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        hotel: hotelId,
        room: roomId,
        quantity,
        price: room.price,
      });
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populatedCart = await cart
      .populate('items.hotel')
      .populate('items.room')
      .execPopulate();

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Unable to add item to cart', error: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    item.quantity = quantity;
    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populatedCart = await cart
      .populate('items.hotel')
      .populate('items.room')
      .execPopulate();

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update cart item', error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items.id(itemId)?.remove();
    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populatedCart = await cart
      .populate('items.hotel')
      .populate('items.room')
      .execPopulate();

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Unable to remove cart item', error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to clear cart', error: error.message });
  }
};