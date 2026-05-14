const Booking = require("../models/Booking");
const User = require("../models/User");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      property,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      pricePerNight,
      specialRequests,
      guestName,
      guestEmail,
      guestPhone,
    } = req.body;

    // Validate required fields
    if (
      !property ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfGuests ||
      !numberOfRooms ||
      !pricePerNight
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (numberOfNights <= 0) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date",
      });
    }

    const totalPrice = pricePerNight * numberOfNights;

    const bookingData = {
      user: req.user._id,
      property,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      totalPrice,
      pricePerNight,
      numberOfNights,
      specialRequests,
      guestName: guestName || req.user.name,
      guestEmail: guestEmail || req.user.email,
      guestPhone: guestPhone || req.user.mobile,
    };

    const booking = new Booking(bookingData);
    await booking.save();

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get all bookings for a user
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "user",
      "name email mobile"
    );

    return res.status(200).json({
      message: "User bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate(
      "user",
      "name email mobile"
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Not authorized to access this booking",
      });
    }

    return res.status(200).json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { checkInDate, checkOutDate, numberOfGuests, numberOfRooms, specialRequests } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this booking",
      });
    }

    // Only allow updates for pending bookings
    if (booking.bookingStatus !== "PENDING") {
      return res.status(400).json({
        message: "Can only update pending bookings",
      });
    }

    // Update fields
    if (checkInDate) booking.checkInDate = checkInDate;
    if (checkOutDate) booking.checkOutDate = checkOutDate;
    if (numberOfGuests) booking.numberOfGuests = numberOfGuests;
    if (numberOfRooms) booking.numberOfRooms = numberOfRooms;
    if (specialRequests) booking.specialRequests = specialRequests;

    // Recalculate total price if dates changed
    if (checkInDate || checkOutDate) {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      booking.numberOfNights = numberOfNights;
      booking.totalPrice = booking.pricePerNight * numberOfNights;
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Not authorized to cancel this booking",
      });
    }

    // Only allow cancellation for pending/confirmed bookings
    if (!["PENDING", "CONFIRMED"].includes(booking.bookingStatus)) {
      return res.status(400).json({
        message: "Cannot cancel this booking in its current status",
      });
    }

    booking.bookingStatus = "CANCELLED";
    booking.cancellationReason = cancellationReason;
    booking.cancellationDate = new Date();

    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get all bookings (ADMIN only)
const getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can access all bookings",
      });
    }

    const bookings = await Booking.find().populate("user", "name email mobile").sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getAllBookings,
};
