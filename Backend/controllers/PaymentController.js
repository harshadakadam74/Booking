const { randomUUID } = require('crypto');
const PaymentService = require('../services/PaymentService');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Property = require('../models/Property');
const {
  findRoomType,
  getBookedRooms,
  getRemainingRooms,
} = require('../services/bookingInventory');
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
  let bookingLockToken;
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
    const listing = booking.propertyId ? await Property.findById(booking.propertyId) : null;
    if (!listing || listing.active === false ||
      (listing.approvalStatus && listing.approvalStatus !== 'approved') ||
      listing.isDemo || (listing.currency && listing.currency !== 'INR')) {
      return ApiResponse.error(res, 409, 'This hotel is no longer eligible for payment.');
    }
    if (booking.roomTypeId && !findRoomType(listing, booking.roomTypeId)) {
      return ApiResponse.error(res, 409, 'The selected room type is no longer available.');
    }
    const bookedRooms = await getBookedRooms({
      property: listing,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      excludeBookingId: booking._id,
    });
    if (getRemainingRooms(listing, bookedRooms) < booking.numberOfRooms) {
      return ApiResponse.error(res, 409, 'There are no longer enough hotel rooms available for this booking.');
    }
    if (booking.roomTypeId) {
      const roomType = findRoomType(listing, booking.roomTypeId);
      const bookedRoomTypeRooms = await getBookedRooms({
        property: listing,
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
        excludeBookingId: booking._id,
        roomTypeId: booking.roomTypeId,
      });
      if (getRemainingRooms(roomType, bookedRoomTypeRooms) < booking.numberOfRooms) {
        return ApiResponse.error(res, 409, 'There are no longer enough rooms of this type available.');
      }
    }

    const amount = Number(booking.totalPrice);
    if (!Number.isFinite(amount) || amount <= 0) {
      return ApiResponse.error(res, 400, 'Booking amount is invalid.');
    }

    const findPendingOrder = () => Payment.findOne({
      bookingId,
      userId: req.user._id,
      paymentMethod,
      paymentStatus: 'PENDING',
    }).sort({ createdAt: -1 });
    const existingPayment = await findPendingOrder();
    if (existingPayment?.metadata?.id) {
      return ApiResponse.success(res, {
        order: existingPayment.metadata,
        payment: existingPayment,
        key: process.env.RAZORPAY_KEY_ID,
      }, 'Existing payment order returned');
    }

    bookingLockToken = randomUUID();
    const now = new Date();
    const lockedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        user: req.user._id,
        bookingStatus: 'PENDING',
        paymentStatus: { $ne: 'SUCCESS' },
        $or: [
          { 'paymentOrderLock.expiresAt': { $exists: false } },
          { 'paymentOrderLock.expiresAt': { $lt: now } },
        ],
      },
      {
        $set: {
          'paymentOrderLock.token': bookingLockToken,
          'paymentOrderLock.expiresAt': new Date(now.getTime() + 120000),
        },
      },
      { new: true }
    );
    if (!lockedBooking) {
      const paymentCreatedByAnotherRequest = await findPendingOrder();
      if (paymentCreatedByAnotherRequest?.metadata?.id) {
        return ApiResponse.success(res, {
          order: paymentCreatedByAnotherRequest.metadata,
          payment: paymentCreatedByAnotherRequest,
          key: process.env.RAZORPAY_KEY_ID,
        }, 'Existing payment order returned');
      }
      return ApiResponse.error(res, 409, 'A payment order is already being created. Please retry shortly.');
    }

    const paymentCreatedDuringLock = await findPendingOrder();
    if (paymentCreatedDuringLock?.metadata?.id) {
      return ApiResponse.success(res, {
        order: paymentCreatedDuringLock.metadata,
        payment: paymentCreatedDuringLock,
        key: process.env.RAZORPAY_KEY_ID,
      }, 'Existing payment order returned');
    }

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
  } finally {
    if (bookingLockToken) {
      try {
        await Booking.updateOne(
          { _id: req.body?.bookingId, 'paymentOrderLock.token': bookingLockToken },
          { $unset: { paymentOrderLock: 1 } }
        );
      } catch (error) {
        console.error('Unable to release payment order lock:', error.message);
      }
    }
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

    const gatewayPayment = await PaymentService.retrieveRazorpayPayment(paymentId);
    const expectedAmount = Math.round(Number(booking.totalPrice) * 100);
    if (
      gatewayPayment.order_id !== orderId ||
      gatewayPayment.amount !== expectedAmount ||
      gatewayPayment.currency !== 'INR' ||
      gatewayPayment.status !== 'captured'
    ) {
      return ApiResponse.error(res, 400, 'The payment gateway has not confirmed the expected captured payment.');
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

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
};
