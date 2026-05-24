const express = require('express');
const CartController = require('../controllers/Cartcontroller');
const { authenticate } = require('../middlewares/Authenticate');
const router = express.Router();

router.get('/', authenticate, CartController.getUserCart);
router.post('/item', authenticate, CartController.addItemToCart);
router.put('/item/:cartItemId', authenticate, CartController.updateCartItemQuantity);
router.delete('/item/:cartItemId', authenticate, CartController.removeCartItem);

module.exports = router;
