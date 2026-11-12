import apiClient from "./apiClient";

export const checkBookingEligibility = async (bookingData) => {
  const response = await apiClient.post("/api/v1/bookings/eligibility", bookingData);
  return response.data?.eligibility;
};

// Create a new booking
export const createBooking = async (bookingData, idempotencyKey) => {
  try {
    const response = await apiClient.post("/api/v1/bookings/create", bookingData, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's bookings
export const getUserBookings = async () => {
  try {
    const response = await apiClient.get("/api/v1/bookings/my-bookings");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await apiClient.get(`/api/v1/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update booking
export const updateBooking = async (bookingId, bookingData) => {
  try {
    const response = await apiClient.put(
      `/api/v1/bookings/${bookingId}`,
      bookingData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, cancellationReason) => {
  try {
    const response = await apiClient.post(
      `/api/v1/bookings/${bookingId}/cancel`,
      { cancellationReason }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all bookings (admin only)
export const getAllBookings = async () => {
  try {
    const response = await apiClient.get("/api/v1/bookings/admin/all-bookings");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createPaymentOrder = async (bookingId) => {
  try {
    const response = await apiClient.post('/api/v1/payments/create-order', {
      bookingId,
      paymentMethod: 'RAZORPAY',
    });
    return response.data?.data || response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Unable to create payment order';
    throw new Error(message);
  }
};

export const verifyPayment = async (bookingId, paymentResponse) => {
  try {
    const response = await apiClient.post('/api/v1/payments/verify', {
      bookingId,
      paymentMethod: 'RAZORPAY',
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    });
    return response.data?.data || response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Payment verification failed';
    throw new Error(message);
  }
};

export const createBookingReview = async (payload) => {
  try {
    const response = await apiClient.post('/api/v1/reviews/booking', payload);
    return response.data?.data?.review || response.data?.review;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBookingReview = async (bookingId) => {
  try {
    const response = await apiClient.get(`/api/v1/reviews/booking/${bookingId}`);
    return response.data?.data?.review || null;
  } catch (error) {
    throw error.response?.data || error;
  }
};
