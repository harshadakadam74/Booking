const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticate } = require('../middlewares/Authenticate');
const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.get('/hot-deals', ProductController.getHotDeals);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/:productId', ProductController.getProductById);
router.post('/', authenticate, ProductController.createProduct);
router.put('/:productId', authenticate, ProductController.updateProduct);
router.delete('/:productId', authenticate, ProductController.deleteProduct);

module.exports = router;
