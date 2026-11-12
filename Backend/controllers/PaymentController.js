const { randomUUID } = require('crypto');
const PaymentService = require('../services/PaymentService');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const PaymentIntent = require('../models/PaymentIntent');
const Property = require('../models/Property');
const {
  findRoomType,
  getBookedRooms,
  getRemainingRooms,
  acquirePropertyBookingLock,
  releasePropertyBookingLock,
} = require('../services/bookingInventory');
const ApiResponse = require('../Utils/ApiResponse');
const { getDateRangeError, validateBillingAddress } = require('./BookingController');

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

const createLegacyOrder = async (req, res) => {
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

const getPaymentIntentRequest = (body, user) => {
  const propertyId = String(body.propertyId || '');
  if (!/^[a-f\d]{24}$/i.test(propertyId)) {
    return { error: 'A valid hotel ID is required.', status: 400 };
  }
  const checkInDate = new Date(body.checkInDate);
  const checkOutDate = new Date(body.checkOutDate);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return { error: 'Check-in and check-out must be valid dates.', status: 400 };
  }
  const dateError = getDateRangeError(checkInDate, checkOutDate);
  if (dateError) return { error: dateError, status: 400 };

  const numberOfGuests = Number(body.numberOfGuests);
  const numberOfRooms = Number(body.numberOfRooms);
  if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1 || numberOfGuests > 20 ||
    !Number.isInteger(numberOfRooms) || numberOfRooms < 1 || numberOfRooms > 10 ||
    numberOfRooms > numberOfGuests) {
    return { error: 'Provide 1–20 guests and 1–10 rooms, with no more rooms than guests.', status: 400 };
  }
  if (body.specialRequests !== undefined &&
    (typeof body.specialRequests !== 'string' || body.specialRequests.length > 2000)) {
    return { error: 'Special requests must be 2000 characters or fewer.', status: 400 };
  }
  const validatedBillingAddress = validateBillingAddress(body.billingAddress);
  if (validatedBillingAddress.error) {
    return { error: validatedBillingAddress.error, status: 400 };
  }
  if (body.roomTypeId !== undefined &&
    (typeof body.roomTypeId !== 'string' || !/^[a-f\d]{24}$/i.test(body.roomTypeId))) {
    return { error: 'A valid room type ID is required.', status: 400 };
  }

  const idempotencyKey = String(body.idempotencyKey || '').trim();
  if (idempotencyKey.length > 128) {
    return { error: 'Idempotency-Key must be 128 characters or fewer.', status: 400 };
  }

  return {
    value: {
      userId: user._id,
      propertyId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      roomTypeId: body.roomTypeId || undefined,
      specialRequests: body.specialRequests || '',
      guestName: String(body.guestName || user.name || '').trim(),
      guestEmail: String(body.guestEmail || user.email || '').trim(),
      guestPhone: String(body.guestPhone || user.mobile || '').trim(),
      guestLocation: body.guestLocation || undefined,
      billingAddress: validatedBillingAddress.value,
      idempotencyKey: idempotencyKey || undefined,
    },
  };
};

const samePaymentIntentRequest = (intent, request) => (
  String(intent.propertyId) === String(request.propertyId) &&
  String(intent.roomTypeId || '') === String(request.roomTypeId || '') &&
  intent.checkInDate.toISOString().slice(0, 10) === request.checkInDate.toISOString().slice(0, 10) &&
  intent.checkOutDate.toISOString().slice(0, 10) === request.checkOutDate.toISOString().slice(0, 10) &&
  Number(intent.numberOfGuests) === request.numberOfGuests &&
  Number(intent.numberOfRooms) === request.numberOfRooms
);

const createReservationOrder = async (req, res) => {
  let bookingLock;
  let paymentIntent;
  let renewPaymentIntent = false;
  try {
    if (req.body?.paymentMethod && req.body.paymentMethod !== 'RAZORPAY') {
      return ApiResponse.error(res, 400, 'Only Razorpay payments are currently supported.');
    }
    let values;
    if (req.body?.paymentIntentId) {
      if (!/^[a-f\d]{24}$/i.test(req.body.paymentIntentId)) {
        return ApiResponse.error(res, 400, 'A valid payment reservation ID is required.');
      }
      paymentIntent = await PaymentIntent.findOne({
        _id: req.body.paymentIntentId,
        userId: req.user._id,
      });
      if (!paymentIntent || paymentIntent.status !== 'PENDING' ||
        paymentIntent.expiresAt <= new Date()) {
        return ApiResponse.error(res, 409, 'This payment reservation has expired or is no longer available.');
      }
      values = {
        propertyId: String(paymentIntent.propertyId),
        checkInDate: paymentIntent.checkInDate,
        checkOutDate: paymentIntent.checkOutDate,
        numberOfGuests: paymentIntent.numberOfGuests,
        numberOfRooms: paymentIntent.numberOfRooms,
        roomTypeId: paymentIntent.roomTypeId ? String(paymentIntent.roomTypeId) : undefined,
      };
    } else {
      const request = getPaymentIntentRequest({
        ...(req.body || {}),
        idempotencyKey: req.headers?.['idempotency-key'] || req.body?.idempotencyKey,
      }, req.user);
      if (request.error) return ApiResponse.error(res, request.status, request.error);
      values = request.value;
    }

    if (values.idempotencyKey) {
      paymentIntent = await PaymentIntent.findOne({
        userId: req.user._id,
        idempotencyKey: values.idempotencyKey,
      });
      if (paymentIntent) {
        if (!samePaymentIntentRequest(paymentIntent, values)) {
          return ApiResponse.error(res, 409, 'This idempotency key was already used for different checkout details.');
        }
        renewPaymentIntent = paymentIntent.status === 'EXPIRED' ||
          (paymentIntent.status === 'PENDING' && paymentIntent.expiresAt <= new Date());
        if (paymentIntent.status !== 'PENDING' && !renewPaymentIntent) {
          return ApiResponse.error(res, 409, 'This payment reservation has expired. Return to checkout and try again.');
        }
      }
    }

    const property = await Property.findById(values.propertyId);
    if (!property) return ApiResponse.error(res, 404, 'The selected hotel could not be found.');
    if (property.active === false ||
      (property.approvalStatus && property.approvalStatus !== 'approved') ||
      property.isDemo || (property.currency && property.currency !== 'INR')) {
      return ApiResponse.error(res, 409, 'This hotel is no longer eligible for online payment.');
    }
    let selectedRoomType;
    if (property.roomTypes?.length) {
      if (!values.roomTypeId) return ApiResponse.error(res, 400, 'Select a room type before payment.');
      selectedRoomType = findRoomType(property, values.roomTypeId);
      if (!selectedRoomType) return ApiResponse.error(res, 404, 'The selected room type does not belong to this hotel.');
    } else if (values.roomTypeId) {
      return ApiResponse.error(res, 404, 'This hotel has no matching room type.');
    }
    const maxGuestsPerRoom = Number(selectedRoomType?.maxGuests || property.maxGuestsPerRoom || 4);
    if (values.numberOfGuests > maxGuestsPerRoom * values.numberOfRooms) {
      return ApiResponse.error(res, 400, 'The selected room type does not have enough guest capacity.');
    }
    const pricePerNight = Number(selectedRoomType?.price ?? property.price);
    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
      return ApiResponse.error(res, 409, 'The current hotel price is not available for online payment.');
    }
    const nights = Math.round((values.checkOutDate - values.checkInDate) / 86400000);
    const totalPrice = pricePerNight * nights * values.numberOfRooms;
    if (paymentIntent && !renewPaymentIntent && Number(paymentIntent.totalPrice) !== totalPrice) {
      return ApiResponse.error(res, 409, 'The hotel price changed. Return to checkout to review the current price.');
    }

    bookingLock = await acquirePropertyBookingLock(property._id);
    if (!bookingLock) {
      return ApiResponse.error(res, 409, 'This hotel inventory is being updated. Please retry shortly.');
    }
    const lockedProperty = bookingLock.property;
    if (!paymentIntent && values.idempotencyKey) {
      paymentIntent = await PaymentIntent.findOne({
        userId: req.user._id,
        idempotencyKey: values.idempotencyKey,
      });
      if (paymentIntent && !samePaymentIntentRequest(paymentIntent, values)) {
        return ApiResponse.error(res, 409, 'This idempotency key was already used for different checkout details.');
      }
      if (paymentIntent && paymentIntent.status !== 'PENDING' &&
        paymentIntent.status !== 'EXPIRED') {
        return ApiResponse.error(res, 409, 'This payment reservation has expired. Return to checkout and try again.');
      }
      if (paymentIntent && paymentIntent.status === 'PENDING' && paymentIntent.expiresAt <= new Date()) {
        renewPaymentIntent = true;
      }
      if (paymentIntent && !renewPaymentIntent && Number(paymentIntent.totalPrice) !== totalPrice) {
        return ApiResponse.error(res, 409, 'The hotel price changed. Return to checkout to review the current price.');
      }
      if (paymentIntent?.status === 'EXPIRED') renewPaymentIntent = true;
    }
    const lockedRoomType = values.roomTypeId
      ? findRoomType(lockedProperty, values.roomTypeId)
      : null;
    if (values.roomTypeId && !lockedRoomType) {
      return ApiResponse.error(res, 409, 'The selected room type changed. Review availability and retry.');
    }
    const bookedRooms = await getBookedRooms({
      property: lockedProperty,
      checkIn: values.checkInDate,
      checkOut: values.checkOutDate,
      ...(paymentIntent ? { excludePaymentIntentId: paymentIntent._id } : {}),
    });
    if (getRemainingRooms(lockedProperty, bookedRooms) < values.numberOfRooms) {
      return ApiResponse.error(res, 409, 'There are no longer enough rooms available for these dates.');
    }
    if (lockedRoomType) {
      const bookedRoomTypeRooms = await getBookedRooms({
        property: lockedProperty,
        checkIn: values.checkInDate,
        checkOut: values.checkOutDate,
        roomTypeId: lockedRoomType._id,
        ...(paymentIntent ? { excludePaymentIntentId: paymentIntent._id } : {}),
      });
      if (getRemainingRooms(lockedRoomType, bookedRoomTypeRooms) < values.numberOfRooms) {
        return ApiResponse.error(res, 409, 'There are no longer enough rooms of this type available.');
      }
    }

    if (!renewPaymentIntent && paymentIntent?.razorpayOrderId && paymentIntent.razorpayOrder) {
      return ApiResponse.success(res, {
        order: paymentIntent.razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID,
        paymentIntentId: paymentIntent._id,
        amount: paymentIntent.totalPrice,
        currency: 'INR',
        expiresAt: paymentIntent.expiresAt,
      }, 'Existing payment order returned');
    }

    const now = new Date();
    const intentData = {
        ...values,
        propertyName: lockedProperty.name,
        ...(lockedRoomType ? {
          roomTypeId: lockedRoomType._id,
          roomTypeName: lockedRoomType.name,
        } : {}),
        pricePerNight,
        numberOfNights: nights,
        totalPrice,
        status: 'PENDING',
        expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    };
    if (!paymentIntent) {
      if (values.idempotencyKey) {
        const { userId, idempotencyKey, ...intentUpdate } = intentData;
        paymentIntent = await PaymentIntent.findOneAndUpdate(
          { userId, idempotencyKey },
          { $set: intentUpdate, $setOnInsert: { userId, idempotencyKey } },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
      } else {
        paymentIntent = await PaymentIntent.create(intentData);
      }
    } else if (renewPaymentIntent) {
      Object.assign(paymentIntent, intentData, {
        razorpayOrderId: undefined,
        razorpayOrder: undefined,
        razorpayPaymentId: undefined,
        bookingId: undefined,
        lastError: undefined,
      });
      await paymentIntent.save();
    }

    const order = await PaymentService.createRazorpayOrder({
      amount: Math.round(totalPrice * 100),
      receipt: `reserve_${paymentIntent._id}`,
    });
    paymentIntent.razorpayOrderId = order.id;
    paymentIntent.razorpayOrder = order;
    paymentIntent.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await paymentIntent.save();

    return ApiResponse.success(res, {
      order,
      key: process.env.RAZORPAY_KEY_ID,
      paymentIntentId: paymentIntent._id,
      amount: totalPrice,
      currency: 'INR',
      expiresAt: paymentIntent.expiresAt,
    }, 'Payment order created');
  } catch (error) {
    if (paymentIntent && !paymentIntent.razorpayOrderId) {
      try {
        paymentIntent.status = 'EXPIRED';
        paymentIntent.expiresAt = new Date();
        await paymentIntent.save();
      } catch (saveError) {
        console.error('Unable to release failed payment reservation:', saveError.message);
      }
    }
    const errorMessage = error?.message ||
      error?.error?.description ||
      error?.description ||
      'Unable to create Razorpay order';
    const isConfigurationError = errorMessage.includes('RAZORPAY_KEY_ID') ||
      errorMessage.includes('RAZORPAY_KEY_SECRET') ||
      errorMessage.includes('placeholder') ||
      errorMessage.includes('Authentication failed');
    console.error('Razorpay reservation order error:', errorMessage);
    return ApiResponse.error(
      res,
      isConfigurationError ? 503 : 500,
      isConfigurationError && errorMessage === 'Authentication failed'
        ? 'Razorpay authentication failed. Check that your Test Mode key ID and secret match.'
        : errorMessage
    );
  } finally {
    if (bookingLock) {
      try {
        await releasePropertyBookingLock(bookingLock.property._id, bookingLock.token);
      } catch (error) {
        console.error('Unable to release payment reservation inventory lock:', error.message);
      }
    }
  }
};

const createOrder = async (req, res) => (
  req.body?.bookingId ? createLegacyOrder(req, res) : createReservationOrder(req, res)
);

const savePaymentIntentPayment = async (intent, booking, paymentId, status = 'SUCCESS') => {
  return Payment.findOneAndUpdate(
    { paymentIntentId: intent._id },
    {
      $set: {
        ...(booking ? { bookingId: booking._id } : {}),
        userId: intent.userId,
        paymentIntentId: intent._id,
        amount: intent.totalPrice,
        paymentMethod: 'RAZORPAY',
        transactionId: paymentId,
        paymentStatus: status,
        metadata: { orderId: intent.razorpayOrderId, paymentId },
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

const verifyReservationPayment = async (req, res) => {
  let bookingLock;
  try {
    let {
      paymentIntentId,
      paymentMethod = 'RAZORPAY',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body || {};
    if (!paymentIntentId || !/^[a-f\d]{24}$/i.test(paymentIntentId)) {
      return ApiResponse.error(res, 400, 'A valid payment reservation ID is required.');
    }
    const intent = await PaymentIntent.findOne({ _id: paymentIntentId, userId: req.user._id });
    if (!intent) return ApiResponse.error(res, 404, 'Payment reservation not found.');
    if (intent.status === 'COMPLETED' && intent.bookingId) {
      const booking = await Booking.findById(intent.bookingId);
      if (!booking) return ApiResponse.error(res, 500, 'The confirmed booking could not be loaded.');
      const payment = await savePaymentIntentPayment(intent, booking, intent.razorpayPaymentId);
      return ApiResponse.success(res, { payment, booking }, 'Payment was already verified');
    }
    if (intent.status === 'REFUNDED') {
      return ApiResponse.error(res, 409, 'This payment was already refunded because the room could not be confirmed.');
    }
    if (intent.status === 'REFUND_PENDING') {
      try {
        await PaymentService.refundRazorpayPayment(intent.razorpayPaymentId);
        intent.status = 'REFUNDED';
        await intent.save();
        await savePaymentIntentPayment(intent, null, intent.razorpayPaymentId, 'REFUNDED');
        return ApiResponse.error(res, 409, 'The room could not be confirmed. Your payment has now been refunded.');
      } catch (refundError) {
        console.error('Razorpay refund retry failed:', refundError.message);
        return ApiResponse.error(res, 502, 'The payment was captured but could not be refunded automatically. Contact support with the payment ID.');
      }
    }
    if (intent.status === 'VERIFYING' && intent.expiresAt > new Date()) {
      return ApiResponse.error(res, 409, 'This payment is already being verified. Retry shortly.');
    }
    const recoveringCapturedPayment = intent.status === 'VERIFYING' &&
      intent.expiresAt <= new Date() &&
      Boolean(intent.razorpayPaymentId) &&
      !orderId && !paymentId && !signature;
    if (recoveringCapturedPayment) {
      orderId = intent.razorpayOrderId;
      paymentId = intent.razorpayPaymentId;
    }
    if (paymentMethod !== 'RAZORPAY' || !orderId || !paymentId ||
      orderId !== intent.razorpayOrderId) {
      return ApiResponse.error(res, 400, 'The payment does not match this reservation.');
    }
    const verified = recoveringCapturedPayment || PaymentService.verifyRazorpaySignature(
      orderId,
      paymentId,
      signature,
      process.env.RAZORPAY_KEY_SECRET
    );
    if (!verified) return ApiResponse.error(res, 400, 'Payment could not be verified.');

    const gatewayPayment = await PaymentService.retrieveRazorpayPayment(paymentId);
    if (gatewayPayment.order_id !== orderId ||
      gatewayPayment.amount !== Math.round(Number(intent.totalPrice) * 100) ||
      gatewayPayment.currency !== 'INR' ||
      gatewayPayment.status !== 'captured') {
      return ApiResponse.error(res, 400, 'The payment gateway has not confirmed the expected captured payment.');
    }

    const lockedIntent = await PaymentIntent.findOneAndUpdate(
      {
        _id: intent._id,
        userId: req.user._id,
        $or: [
          { status: 'PENDING' },
          { status: 'VERIFYING', expiresAt: { $lte: new Date() } },
        ],
      },
      {
        $set: {
          status: 'VERIFYING',
          razorpayPaymentId: paymentId,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      },
      { new: true }
    );
    if (!lockedIntent) {
      const latestIntent = await PaymentIntent.findOne({ _id: intent._id, userId: req.user._id });
      if (latestIntent?.status === 'COMPLETED' && latestIntent.bookingId) {
        const booking = await Booking.findById(latestIntent.bookingId);
        const payment = await savePaymentIntentPayment(latestIntent, booking, latestIntent.razorpayPaymentId);
        return ApiResponse.success(res, { payment, booking }, 'Payment was already verified');
      }
      return ApiResponse.error(res, 409, 'This payment reservation is already being verified or has expired.');
    }

    bookingLock = await acquirePropertyBookingLock(lockedIntent.propertyId);
    if (!bookingLock) {
      return ApiResponse.error(res, 409, 'Payment was captured and recorded. Inventory is being updated; retry confirmation shortly.');
    }
    const property = bookingLock.property;
    const roomType = lockedIntent.roomTypeId
      ? findRoomType(property, lockedIntent.roomTypeId)
      : null;
    const unavailableReason = property.active === false ||
      (property.approvalStatus && property.approvalStatus !== 'approved') ||
      property.isDemo ||
      (lockedIntent.roomTypeId && !roomType)
      ? 'The hotel or selected room is no longer eligible for booking.'
      : '';
    const bookedRooms = await getBookedRooms({
      property,
      checkIn: lockedIntent.checkInDate,
      checkOut: lockedIntent.checkOutDate,
      excludePaymentIntentId: lockedIntent._id,
    });
    let inventoryError = unavailableReason;
    if (!inventoryError && getRemainingRooms(property, bookedRooms) < lockedIntent.numberOfRooms) {
      inventoryError = 'The selected hotel no longer has enough rooms for these dates.';
    }
    if (!inventoryError && roomType) {
      const bookedRoomTypeRooms = await getBookedRooms({
        property,
        checkIn: lockedIntent.checkInDate,
        checkOut: lockedIntent.checkOutDate,
        roomTypeId: roomType._id,
        excludePaymentIntentId: lockedIntent._id,
      });
      if (getRemainingRooms(roomType, bookedRoomTypeRooms) < lockedIntent.numberOfRooms) {
        inventoryError = 'The selected room type no longer has enough inventory for these dates.';
      }
    }

    if (inventoryError) {
      lockedIntent.status = 'REFUND_PENDING';
      lockedIntent.lastError = inventoryError;
      await lockedIntent.save();
      try {
        await PaymentService.refundRazorpayPayment(paymentId);
        lockedIntent.status = 'REFUNDED';
        await lockedIntent.save();
        await savePaymentIntentPayment(lockedIntent, null, paymentId, 'REFUNDED');
        return ApiResponse.error(res, 409, `${inventoryError} Your payment was refunded.`);
      } catch (refundError) {
        console.error('Razorpay refund failed after booking inventory changed:', refundError.message);
        await savePaymentIntentPayment(lockedIntent, null, paymentId, 'PENDING');
        return ApiResponse.error(res, 502, `${inventoryError} The payment was captured and a refund is being processed. Contact support if it does not appear.`);
      }
    }

    const existingBooking = await Booking.findOne({ 'paymentDetails.paymentId': paymentId });
    const booking = existingBooking || await Booking.create({
      user: lockedIntent.userId,
      confirmationNumber: `FB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      property: property.name,
      propertyId: property._id,
      ...(roomType ? { roomTypeId: roomType._id, roomTypeName: roomType.name } : {}),
      checkInDate: lockedIntent.checkInDate,
      checkOutDate: lockedIntent.checkOutDate,
      numberOfGuests: lockedIntent.numberOfGuests,
      numberOfRooms: lockedIntent.numberOfRooms,
      totalPrice: lockedIntent.totalPrice,
      pricePerNight: lockedIntent.pricePerNight,
      numberOfNights: lockedIntent.numberOfNights,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      paymentDetails: {
        paymentMethod: 'RAZORPAY',
        transactionId: paymentId,
        paymentId,
        amount: lockedIntent.totalPrice,
      },
      specialRequests: lockedIntent.specialRequests,
      guestName: lockedIntent.guestName,
      guestEmail: lockedIntent.guestEmail,
      guestPhone: lockedIntent.guestPhone,
      guestLocation: lockedIntent.guestLocation,
      billingAddress: lockedIntent.billingAddress,
    });
    lockedIntent.status = 'COMPLETED';
    lockedIntent.bookingId = booking._id;
    lockedIntent.razorpayPaymentId = paymentId;
    await lockedIntent.save();
    const payment = await savePaymentIntentPayment(lockedIntent, booking, paymentId);
    return ApiResponse.success(res, { payment, booking }, 'Payment verified and booking confirmed');
  } catch (error) {
    console.error('Payment reservation verification failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to complete payment verification. Please retry.');
  } finally {
    if (bookingLock) {
      try {
        await releasePropertyBookingLock(bookingLock.property._id, bookingLock.token);
      } catch (error) {
        console.error('Unable to release payment verification inventory lock:', error.message);
      }
    }
  }
};

const verifyPayment = async (req, res) => (
  req.body?.paymentIntentId ? verifyReservationPayment(req, res) : verifyLegacyPayment(req, res)
);

const verifyLegacyPayment = async (req, res) => {
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
