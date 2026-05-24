const CartService = require('../services/CartService');

const getUserCart = async (req, res) => {
  try {
    const data = await CartService.findUserCart(req.user._id);
    return res.status(200).json({ message: 'Cart fetched successfully', ...data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const data = await CartService.addCartItem(req.user._id, productId);
    return res.status(200).json({ message: 'Item added to cart successfully', ...data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    if (quantity == null) {
      return res.status(400).json({ message: 'quantity is required' });
    }

    const item = await CartService.updateCartItemQuantity(req.user._id, cartItemId, Number(quantity));
    return res.status(200).json({ message: 'Cart item updated successfully', item });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const result = await CartService.removeCartItem(req.user._id, cartItemId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserCart, addItemToCart, updateCartItemQuantity, removeCartItem };
