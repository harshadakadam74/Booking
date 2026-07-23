const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { authenticate } = require('../middlewares/Authenticate');

router.post('/create-order', authenticate, PaymentController.createOrder);
router.post('/verify', authenticate, PaymentController.verifyPayment);
router.post('/webhook', PaymentController.handleWebhook);
router.get('/history', authenticate, PaymentController.getPaymentHistory);

module.exports = router;
