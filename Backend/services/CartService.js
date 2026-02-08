const Cart = require("../models/Cart");
const Product = require("../models/Product");
const CartItem = require("../models/CartItems");

const createCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId });
  }
  return cart;
};

const updateCartTotals = async (cartId) => {
  const items = await CartItem.find({ cart: cartId });
  let totalPrice = 0;
  let totalPayable = 0;
  let totalItem = 0;

  item.forEach((item) => {
    totalPrice += item.price;
    totalPayable += item.discountedPrice;
    total += item.quantity;
  });

  await Cart.findByIdAndUpdate(cartId, {
    totalPrice,
    totalPayable,
    totalItem,
    discount: totalPrice - totalPayable,
  });
};

// Get user cart
const findUserCart = async (userId) => {
  const cart = await createCart(userId);
  const items = await CartItem.find({ cart: cart._id }).populate(
    "product",
    "title brand image",
  );
  return { cart, items };
};

//Add Item to Cart
const addCartItem = async (userId, productId) => {
  const cart = await createCart(userId);

  const product = await product.findById(productId);
  if (!product) throw new Error("productId");

  //Find exising cart item (no SKU variants)
  const existingItem = await CartItem.findOne({
    cart: cart._id,
    product: product._id,
  });

  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.price = product.price * existingItem.quantity;
    existingItem.discountedPrice =
      product.discountedPrice * existingItem.quantity;

    await existingItem.save();
  } else {
    await CartItem.create({
      cart: cart._id,
      user: userId,
      product: product._id,
      productsku: product.productsku,
      quantity: 1,
      price: product.price,
      discountedPrice: product.discountedPrice,
      discount: product.discount,
      image: product.image,
    });
  }

  await updateCartTotals(cart._id);
  return await findUserCart(userId);
};

// Update quantity

const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
  const item = await CartItem.findById(cartItemId);
  if (!item) throw new Error(" Cart item not found ");

  if (item.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  const product = await Product.findById(item.product);
  if (!product) throw new Error(" Product Not Found ");
  
  //Optional: prevent zero or negative quantity
  if(quantity < 1) throw new Error(" Quantity must br at least 1 ");

  item.quantity = quantity;
  item.price = product.price * quantity;
  item.discountedPrice = product.discountedPrice * quantity;

  await item.save();
  await updateCartTotals(item.cart);

  return item;
};

// Remove item
const removeCartItem = async (userId, cartItemId) => {
    const item = await CartItem.findById(cartItemId);
    if (!item) throw new Error(" Cart item not found ");
    if (item.user.toString() !== userId.toString())
        throw new Error (" Unauthorized ");

    await CartItem.findByIdAndDelete(cartItemId);
    await updateCartTotals(item.cart);

    return { message: "Item removed from cart" };
}

module.exports = {
    createCart,
    updateCartTotals,
    updateCartItemQuantity,
    removeCartItem,
    addCartItem,
    findUserCart
}