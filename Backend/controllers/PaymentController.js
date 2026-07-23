const PaymentService = require('../services/PaymentService');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ApiResponse = require('../Utils/ApiResponse');

const createOrder = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      return ApiResponse.error(res, 400, 'bookingId, amount and paymentMethod are required');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return ApiResponse.error(res, 404, 'Booking not found');
    }

    let order;
    if (paymentMethod === 'RAZORPAY') {
      order = await PaymentService.createRazorpayOrder({ amount: Math.round(amount * 100), receipt: `booking_${bookingId}` });
    } else {
      order = await PaymentService.createStripePaymentIntent({ amount: Math.round(amount * 100), currency: 'usd', metadata: { bookingId, userId: req.user._id.toString() } });
    }

    const payment = await PaymentService.savePayment({
      userId: req.user._id,
      bookingId,
      amount,
      paymentMethod,
      transactionId: order.id || order.payment_intent || null,
      paymentStatus: 'PENDING',
      metadata: order,
    });

    return ApiResponse.success(res, { order, payment }, 'Payment order created');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, signature, orderId, paymentId, paymentIntentId } = req.body;

    if (!bookingId || !paymentMethod) {
      return ApiResponse.error(res, 400, 'bookingId and paymentMethod are required');
    }

    let verified = false;
    if (paymentMethod === 'RAZORPAY') {
      verified = PaymentService.verifyRazorpaySignature(req.body, signature, process.env.RAZORPAY_KEY_SECRET);
    } else if (paymentMethod === 'STRIPE') {
      const paymentIntent = await PaymentService.retrieveStripePaymentIntent(paymentIntentId);
      verified = paymentIntent && paymentIntent.status === 'succeeded';
    }

    if (!verified) {
      return ApiResponse.error(res, 400, 'Payment could not be verified');
    }

    const paymentData = {
      bookingId,
      userId: req.user._id,
      amount: req.body.amount,
      paymentMethod,
      transactionId: paymentId || orderId || paymentIntentId,
      paymentStatus: 'SUCCESS',
    };

    const payment = await PaymentService.savePayment(paymentData);
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'SUCCESS', bookingStatus: 'CONFIRMED' });

    return ApiResponse.success(res, { payment }, 'Payment verified successfully');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

const handleWebhook = async (req, res) => {
  try {
    const event = await PaymentService.handleWebhook(req);
    if (event) {
      return res.status(200).json({ received: true, eventType: event.type });
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await PaymentService.getPaymentHistoryForUser(req.user._id);
    return ApiResponse.success(res, { payments }, 'Payment history loaded');
  } catch (error) {
    return ApiResponse.error(res, 500, error.message);
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook, getPaymentHistory };
