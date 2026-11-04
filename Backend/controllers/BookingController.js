const Booking = require("../models/Booking");
const Property = require("../models/Property");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  acquirePropertyBookingLock,
  acquireBookingStatusLock,
  releasePropertyBookingLock,
  getBookedRooms,
  getRemainingRooms,
} = require("../services/bookingInventory");

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDateRangeError = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "Check-in and check-out must be valid dates.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkIn < today) return "Check-in date cannot be in the past.";
  if (checkOut <= checkIn) return "Check-out date must be after check-in date.";
  return "";
};

// Create a new booking
const createBooking = async (req, res) => {
  let bookingLock;
  try {
    const {
      property,
      propertyId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      pricePerNight,
      specialRequests,
      guestName,
      guestEmail,
      guestPhone,
      guestLocation,
    } = req.body || {};

    if ((!propertyId && (typeof property !== "string" || !property.trim())) ||
      !checkInDate || !checkOutDate ||
      !Number.isInteger(Number(numberOfGuests)) ||
      !Number.isInteger(Number(numberOfRooms)) ||
      Number(numberOfGuests) < 1 || Number(numberOfGuests) > 20 ||
      Number(numberOfRooms) < 1 || Number(numberOfRooms) > 10 ||
      Number(numberOfRooms) > Number(numberOfGuests)) {
      return res.status(400).json({
        message: "Provide a hotel, valid stay dates, 1–20 guests, and 1–10 rooms.",
      });
    }

    if (propertyId && !mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "A valid hotel ID is required." });
    }

    const checkIn = toDate(checkInDate);
    const checkOut = toDate(checkOutDate);
    const dateError = getDateRangeError(checkIn, checkOut);
    if (dateError) return res.status(400).json({ message: dateError });

    const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (specialRequests !== undefined &&
      (typeof specialRequests !== 'string' || specialRequests.length > 2000)) {
      return res.status(400).json({ message: "Special requests must be 2000 characters or fewer." });
    }
    const propertyFilter = propertyId
      ? { _id: propertyId }
      : { name: property.trim() };
    const listing = await Property.findOne({
      ...propertyFilter,
      active: { $ne: false },
      $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
    });
    if (!listing) {
      return res.status(404).json({ message: "This hotel is not currently bookable." });
    }
    if (listing.isDemo) {
      return res.status(409).json({ message: "Demo listings are for display and testing only and cannot be booked." });
    }

    const rooms = Number(numberOfRooms);
    const guests = Number(numberOfGuests);
    if (guests > Number(listing.maxGuestsPerRoom || 4) * rooms) {
      return res.status(400).json({ message: "The selected rooms do not have enough guest capacity." });
    }

    if (pricePerNight !== undefined && pricePerNight !== null &&
      (!Number.isFinite(Number(pricePerNight)) ||
        Math.abs(Number(pricePerNight) - listing.price) > 0.01)) {
      return res.status(409).json({
        message: "The hotel price has changed. Review the current price before booking.",
        currentPricePerNight: listing.price,
        currency: listing.currency || "INR",
      });
    }

    bookingLock = await acquirePropertyBookingLock(listing._id);
    if (!bookingLock) {
      return res.status(409).json({ message: "This hotel is being booked right now. Please retry in a moment." });
    }
    const bookedRooms = await getBookedRooms({ property: bookingLock.property, checkIn, checkOut });
    const remainingRooms = getRemainingRooms(bookingLock.property, bookedRooms);
    if (remainingRooms < rooms) {
      return res.status(409).json({ message: "Not enough rooms are available for the selected dates." });
    }

    const booking = await Booking.create({
      user: req.user._id,
      property: bookingLock.property.name,
      propertyId: bookingLock.property._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: guests,
      numberOfRooms: rooms,
      totalPrice: bookingLock.property.price * nights * rooms,
      pricePerNight: bookingLock.property.price,
      numberOfNights: nights,
      specialRequests,
      guestName: guestName || req.user.name,
      guestEmail: guestEmail || req.user.email,
      guestPhone: guestPhone || req.user.mobile,
      guestLocation,
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking creation failed:", error.message);
    return res.status(500).json({
      message: "Unable to create booking.",
    });
  } finally {
    if (bookingLock) {
      try {
        await releasePropertyBookingLock(bookingLock.property._id, bookingLock.token);
      } catch (error) {
        console.error("Unable to release hotel booking lock:", error.message);
      }
    }
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
  let bookingLock;
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
    const nextCheckIn = checkInDate === undefined ? booking.checkInDate : toDate(checkInDate);
    const nextCheckOut = checkOutDate === undefined ? booking.checkOutDate : toDate(checkOutDate);
    const dateError = getDateRangeError(nextCheckIn, nextCheckOut);
    if (dateError) return res.status(400).json({ message: dateError });
    const nextGuests = numberOfGuests === undefined ? booking.numberOfGuests : Number(numberOfGuests);
    const nextRooms = numberOfRooms === undefined ? booking.numberOfRooms : Number(numberOfRooms);
    if (!Number.isInteger(nextGuests) || nextGuests < 1 || nextGuests > 20 ||
      !Number.isInteger(nextRooms) || nextRooms < 1 || nextRooms > 10 || nextRooms > nextGuests) {
      return res.status(400).json({ message: "Guests and rooms must be valid whole numbers." });
    }
    const propertyRecord = booking.propertyId
      ? await Property.findById(booking.propertyId)
      : await Property.findOne({ name: booking.property });
    if (propertyRecord) {
      if (nextGuests > Number(propertyRecord.maxGuestsPerRoom || 4) * nextRooms) {
        return res.status(400).json({ message: "The selected rooms do not have enough guest capacity." });
      }
      bookingLock = await acquirePropertyBookingLock(propertyRecord._id);
      if (!bookingLock) {
        return res.status(409).json({ message: "This hotel is being updated by another booking. Please retry." });
      }
      const bookedRooms = await getBookedRooms({
        property: bookingLock.property,
        checkIn: nextCheckIn,
        checkOut: nextCheckOut,
        excludeBookingId: booking._id,
      });
      if (getRemainingRooms(bookingLock.property, bookedRooms) < nextRooms) {
        return res.status(409).json({ message: "Not enough rooms are available for the selected dates." });
      }
    }

    booking.checkInDate = nextCheckIn;
    booking.checkOutDate = nextCheckOut;
    booking.numberOfGuests = nextGuests;
    booking.numberOfRooms = nextRooms;
    if (typeof specialRequests === "string") booking.specialRequests = specialRequests.slice(0, 2000);
    booking.numberOfNights = Math.round((nextCheckOut - nextCheckIn) / (1000 * 60 * 60 * 24));
    booking.totalPrice = booking.pricePerNight * booking.numberOfNights * nextRooms;
    await booking.save();

    return res.status(200).json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking update failed:", error.message);
    return res.status(500).json({
      message: "Unable to update booking.",
    });
  } finally {
    if (bookingLock) {
      try {
        await releasePropertyBookingLock(bookingLock.property._id, bookingLock.token);
      } catch (error) {
        console.error("Unable to release hotel booking lock:", error.message);
      }
    }
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

    const cancelledBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        bookingStatus: { $in: ["PENDING", "CONFIRMED"] },
      },
      {
        $set: {
          bookingStatus: "CANCELLED",
          cancellationReason,
          cancellationDate: new Date(),
        },
      },
      { new: true }
    );
    if (!cancelledBooking) {
      return res.status(409).json({
        message: "The booking status changed. Refresh and try again.",
      });
    }

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
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

// Update booking status or payment status (ADMIN only)
const adminUpdateBookingStatus = async (req, res) => {
  let bookingLock;
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can update booking status",
      });
    }

    const { bookingId } = req.params;
    const { bookingStatus, paymentStatus, paymentDetails } = req.body || {};

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }
    const previousStatus = booking.bookingStatus;
    const updates = {};

    const validBookingStatuses = ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"];
    const validPaymentStatuses = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

    if (bookingStatus) {
      if (!validBookingStatuses.includes(bookingStatus)) {
        return res.status(400).json({
          message: "Invalid booking status",
        });
      }
      if (["PENDING", "CONFIRMED", "CHECKED_IN"].includes(bookingStatus)) {
        const inventory = await acquireBookingStatusLock(booking);
        bookingLock = inventory.bookingLock;
        if (inventory.error) {
          return res.status(409).json({ message: inventory.error });
        }
      }
      if (bookingStatus === "COMPLETED" && booking.checkOutDate > new Date()) {
        return res.status(409).json({
          message: "A booking cannot be completed before its check-out date.",
        });
      }
      updates.bookingStatus = bookingStatus;
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          message: "Invalid payment status",
        });
      }
      updates.paymentStatus = paymentStatus;
    }

    if (paymentDetails) {
      updates.paymentDetails = {
        ...booking.paymentDetails,
        ...paymentDetails,
      };
    }

    const updatedBooking = Object.keys(updates).length
      ? await Booking.findOneAndUpdate(
        { _id: booking._id, bookingStatus: previousStatus },
        { $set: updates },
        { new: true }
      )
      : booking;
    if (!updatedBooking) {
      return res.status(409).json({
        message: "The booking status changed. Refresh and try again.",
      });
    }

    return res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  } finally {
    if (bookingLock) {
      try {
        await releasePropertyBookingLock(bookingLock.property._id, bookingLock.token);
      } catch (error) {
        console.error("Unable to release hotel booking lock:", error.message);
      }
    }
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getAllBookings,
  adminUpdateBookingStatus,
  getDateRangeError,
};
