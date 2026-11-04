const PaymentService = require('../services/PaymentService');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ApiResponse = require('../Utils/ApiResponse');

const recordSuccessfulBookingPayment = async (bookingId, paymentDetails) => {
  const confirmedBooking = await Booking.findOneAndUpdate(
    { _id: bookingId, bookingStatus: 'PENDING' },
    {
      $set: {
        paymentStatus: 'SUCCESS',
        bookingStatus: 'CONFIRMED',
        paymentDetails,
      },
    },
    { new: true }
  );
  if (confirmedBooking) return confirmedBooking;

  return Booking.findByIdAndUpdate(
    bookingId,
    { $set: { paymentStatus: 'SUCCESS', paymentDetails } },
    { new: true }
  );
};

const createOrder = async (req, res) => {
  try {
    const { bookingId, paymentMethod = 'RAZORPAY' } = req.body;

    if (!bookingId || paymentMethod !== 'RAZORPAY') {
      return ApiResponse.error(res, 400, 'bookingId and Razorpay payment method are required');
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) {
      return ApiResponse.error(res, 404, 'Booking not found');
    }
    if (booking.paymentStatus === 'SUCCESS') {
      return ApiResponse.error(res, 400, 'Booking is already paid');
    }
    if (booking.bookingStatus !== 'PENDING') {
      return ApiResponse.error(res, 409, 'Payment is only available for pending bookings.');
    }

    const amount = Number(booking.totalPrice);
    const order = await PaymentService.createRazorpayOrder({
      amount: Math.round(amount * 100),
      receipt: `booking_${bookingId}`,
    });

    const payment = await PaymentService.savePayment({
      userId: req.user._id,
      bookingId,
      amount,
      paymentMethod,
      transactionId: order.id,
      paymentStatus: 'PENDING',
      metadata: order,
    });

    return ApiResponse.success(res, {
      order,
      payment,
      key: process.env.RAZORPAY_KEY_ID,
    }, 'Payment order created');
  } catch (error) {
    const errorMessage = error?.message ||
      error?.error?.description ||
      error?.description ||
      'Unable to create Razorpay order';
    const isConfigurationError = errorMessage.includes('RAZORPAY_KEY_ID') ||
      errorMessage.includes('RAZORPAY_KEY_SECRET') ||
      errorMessage.includes('placeholder') ||
      errorMessage.includes('Authentication failed');
    console.error('Razorpay order error:', errorMessage);
    return ApiResponse.error(
      res,
      isConfigurationError ? 503 : 500,
      isConfigurationError && errorMessage === 'Authentication failed'
        ? 'Razorpay authentication failed. Check that your Test Mode key ID and secret match.'
        : errorMessage
    );
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      paymentMethod = 'RAZORPAY',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!bookingId || !paymentMethod) {
      return ApiResponse.error(res, 400, 'bookingId and paymentMethod are required');
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return ApiResponse.error(res, 404, 'Booking not found');

    const pendingPayment = await Payment.findOne({
      bookingId,
      userId: req.user._id,
      transactionId: orderId,
      paymentStatus: 'PENDING',
    });
    if (!pendingPayment) return ApiResponse.error(res, 400, 'Payment order not found');

    const verified = paymentMethod === 'RAZORPAY' && PaymentService.verifyRazorpaySignature(
      orderId,
      paymentId,
      signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!verified) {
      return ApiResponse.error(res, 400, 'Payment could not be verified');
    }

    pendingPayment.transactionId = paymentId;
    pendingPayment.paymentStatus = 'SUCCESS';
    pendingPayment.metadata = { orderId, paymentId };
    const payment = await pendingPayment.save();
    const paymentDetails = {
      paymentMethod: 'RAZORPAY',
      paymentId,
      transactionId: paymentId,
      amount: booking.totalPrice,
    };
    const settledBooking = await recordSuccessfulBookingPayment(booking._id, paymentDetails);
    if (!settledBooking) return ApiResponse.error(res, 404, 'Booking not found after payment verification.');

    const message = settledBooking.bookingStatus === 'CANCELLED'
      ? 'Payment was received after this booking was cancelled. Contact support to arrange a refund.'
      : 'Payment verified successfully';
    return ApiResponse.success(res, { payment, booking: settledBooking }, message);
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

const createDummyPayment = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return ApiResponse.error(res, 404, 'Dummy payments are disabled in production');
    }

    const { bookingId } = req.body;
    if (!bookingId) return ApiResponse.error(res, 400, 'bookingId is required');

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return ApiResponse.error(res, 404, 'Booking not found');
    if (booking.paymentStatus === 'SUCCESS') {
      return ApiResponse.error(res, 400, 'Booking is already paid');
    }
    if (booking.bookingStatus !== 'PENDING') {
      return ApiResponse.error(res, 409, 'Payment is only available for pending bookings.');
    }

    const transactionId = `DUMMY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await new Promise((resolve) => setTimeout(resolve, 800));

    const payment = await PaymentService.savePayment({
      userId: req.user._id,
      bookingId,
      amount: booking.totalPrice,
      paymentMethod: 'DUMMY',
      transactionId,
      paymentStatus: 'SUCCESS',
      metadata: { dummy: true, method: 'Dummy Payment' },
    });

    const paymentDetails = {
      paymentMethod: 'DUMMY',
      paymentId: transactionId,
      transactionId,
      amount: booking.totalPrice,
    };
    const settledBooking = await recordSuccessfulBookingPayment(booking._id, paymentDetails);
    if (!settledBooking) return ApiResponse.error(res, 404, 'Booking not found after payment.');

    const message = settledBooking.bookingStatus === 'CANCELLED'
      ? 'Payment was recorded after this booking was cancelled. Contact support to arrange a refund.'
      : 'Dummy payment successful';
    return ApiResponse.success(res, { payment, booking: settledBooking }, message);
  } catch (error) {
    return ApiResponse.error(res, 500, error.message || 'Dummy payment failed');
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  createDummyPayment,
  handleWebhook,
  getPaymentHistory,
};
