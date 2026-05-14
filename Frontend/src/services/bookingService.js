import apiClient from "./apiClient";

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await apiClient.post("/api/v1/bookings/create", bookingData);
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
