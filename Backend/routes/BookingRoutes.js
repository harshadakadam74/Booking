const express = require("express");
const BookingController = require("../controllers/BookingController");
const { authenticate } = require("../middlewares/Authenticate");

const router = express.Router();

// Create booking (authenticated users)
router.post("/create", authenticate, BookingController.createBooking);

// Get user's bookings
router.get("/my-bookings", authenticate, BookingController.getUserBookings);

// Get booking by ID
router.get("/:bookingId", authenticate, BookingController.getBookingById);

// Update booking
router.put("/:bookingId", authenticate, BookingController.updateBooking);

// Cancel booking
router.post("/:bookingId/cancel", authenticate, BookingController.cancelBooking);

// Get all bookings (admin only)
router.get("/admin/all-bookings", authenticate, BookingController.getAllBookings);

module.exports = router;
