import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBookings: (state, action) => {
      state.bookings = action.payload;
      state.loading = false;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(
        (b) => b._id === action.payload._id
      );
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    },
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (b) => b._id !== action.payload
      );
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setBookings,
  setCurrentBooking,
  addBooking,
  updateBooking,
  removeBooking,
  setError,
  clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
