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
  findRoomType,
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

const getBookingEligibility = async (req, res) => {
  try {
    const {
      propertyId,
      roomTypeId,
      property,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
    } = req.body || {};
    const reasons = [];
    const checkIn = toDate(checkInDate);
    const checkOut = toDate(checkOutDate);
    const dateError = getDateRangeError(checkIn, checkOut);
    const guests = Number(numberOfGuests);
    const rooms = Number(numberOfRooms);

    if (!propertyId && (typeof property !== "string" || !property.trim())) {
      reasons.push({ code: "HOTEL_REQUIRED", message: "Select a hotel to continue." });
    } else if (propertyId && !mongoose.Types.ObjectId.isValid(propertyId)) {
      reasons.push({ code: "INVALID_HOTEL_ID", message: "The selected hotel ID is invalid." });
    }
    if (dateError) reasons.push({ code: "INVALID_DATES", message: dateError });
    if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
      reasons.push({ code: "INVALID_GUESTS", message: "Enter between 1 and 20 guests." });
    }
    if (!Number.isInteger(rooms) || rooms < 1 || rooms > 10 || rooms > guests) {
      reasons.push({ code: "INVALID_ROOMS", message: "Enter between 1 and 10 rooms and no more rooms than guests." });
    }

    let listing;
    let selectedRoomType;
    if (!reasons.some(({ code }) => code === "HOTEL_REQUIRED" || code === "INVALID_HOTEL_ID")) {
      const propertyFilter = propertyId
        ? { _id: propertyId }
        : { name: property.trim() };
      listing = await Property.findOne(propertyFilter);
      if (!listing) {
        reasons.push({ code: "HOTEL_NOT_FOUND", message: "The selected hotel could not be found." });
      } else {
        if (listing.active === false) {
          reasons.push({ code: "HOTEL_INACTIVE", message: "This hotel is inactive and cannot be booked." });
        }
        if (listing.approvalStatus && listing.approvalStatus !== "approved") {
          reasons.push({ code: "HOTEL_UNAPPROVED", message: "This hotel has not been approved for booking." });
        }
        if (listing.isDemo) {
          reasons.push({ code: "DEMO_LISTING", message: "Demo listings cannot be booked." });
        }
        if (listing.roomTypes?.length) {
          if (!roomTypeId) {
            reasons.push({ code: "ROOM_REQUIRED", message: "Select a room type to continue." });
          } else if (!mongoose.Types.ObjectId.isValid(roomTypeId)) {
            reasons.push({ code: "INVALID_ROOM_ID", message: "The selected room type ID is invalid." });
          } else {
            selectedRoomType = findRoomType(listing, roomTypeId);
            if (!selectedRoomType) {
              reasons.push({ code: "ROOM_NOT_FOUND", message: "The selected room type does not belong to this hotel." });
            }
          }
        } else if (roomTypeId) {
          reasons.push({ code: "ROOM_NOT_FOUND", message: "This hotel has no matching room type." });
        }
        if (Number.isInteger(guests) && Number.isInteger(rooms) &&
          selectedRoomType &&
          guests > Number(selectedRoomType.maxGuests || listing.maxGuestsPerRoom || 4) * rooms) {
          reasons.push({ code: "GUEST_CAPACITY", message: "The selected room type does not have enough guest capacity." });
        } else if (Number.isInteger(guests) && Number.isInteger(rooms) &&
          !listing.roomTypes?.length &&
          guests > Number(listing.maxGuestsPerRoom || 4) * rooms) {
          reasons.push({ code: "GUEST_CAPACITY", message: "The selected rooms do not have enough guest capacity." });
        }
      }
    }

    let availableRooms;
    let propertyAvailableRooms;
    let roomTypeAvailableRooms;
    let nights;
    let totalPrice;
    if (listing && !dateError && Number.isInteger(rooms) && rooms > 0) {
      const bookedRooms = await getBookedRooms({ property: listing, checkIn, checkOut });
      propertyAvailableRooms = getRemainingRooms(listing, bookedRooms);
      availableRooms = propertyAvailableRooms;
      if (selectedRoomType) {
        const bookedRoomTypeRooms = await getBookedRooms({
          property: listing,
          checkIn,
          checkOut,
          roomTypeId: selectedRoomType._id,
        });
        roomTypeAvailableRooms = getRemainingRooms(selectedRoomType, bookedRoomTypeRooms);
        availableRooms = Math.min(availableRooms, roomTypeAvailableRooms);
      }
      if (availableRooms < rooms) {
        reasons.push({
          code: "INSUFFICIENT_INVENTORY",
          message: selectedRoomType
            ? `Only ${availableRooms} room${availableRooms === 1 ? "" : "s"} of this type are available for these dates.`
            : `Only ${availableRooms} room${availableRooms === 1 ? "" : "s"} available for these dates.`,
        });
      }
      nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      totalPrice = Number(selectedRoomType?.price ?? listing.price) * nights * rooms;
    }

    return res.status(200).json({
      eligibility: {
        eligible: reasons.length === 0,
        reasons,
        hotel: listing ? { id: listing._id, name: listing.name } : null,
        roomType: selectedRoomType
          ? { id: selectedRoomType._id, name: selectedRoomType.name }
          : null,
        inventory: availableRooms === undefined
          ? null
          : {
            requested: rooms,
            available: availableRooms,
            propertyAvailable: propertyAvailableRooms,
            ...(roomTypeAvailableRooms === undefined ? {} : { roomTypeAvailable: roomTypeAvailableRooms }),
          },
        pricing: totalPrice === undefined
          ? null
          : {
            nights,
            pricePerNight: Number(selectedRoomType?.price ?? listing.price),
            totalPrice,
            currency: listing.currency || "INR",
          },
      },
    });
  } catch (error) {
    console.error("Booking eligibility check failed:", error.message);
    return res.status(500).json({
      eligibility: {
        eligible: false,
        reasons: [{ code: "VALIDATION_FAILED", message: "Unable to validate this booking right now." }],
      },
    });
  }
};

// Create a new booking
const createBooking = async (req, res) => {
  let bookingLock;
  try {
    const {
      property,
      propertyId,
      roomTypeId,
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
    const idempotencyKey = String(req.headers?.["idempotency-key"] || "").trim();

    if (idempotencyKey.length > 128) {
      return res.status(400).json({ message: "Idempotency-Key must be 128 characters or fewer." });
    }

    if (idempotencyKey) {
      const previousRequest = await Booking.findOne({ user: req.user._id, idempotencyKey });
      if (previousRequest) {
        return res.status(200).json({
          message: "This booking request was already processed.",
          booking: previousRequest,
        });
      }
    }

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
    const listing = await Property.findOne(propertyFilter);
    if (!listing) {
      return res.status(404).json({
        message: "The selected hotel could not be found.",
        eligibility: {
          eligible: false,
          reasons: [{ code: "HOTEL_NOT_FOUND", message: "The selected hotel could not be found." }],
        },
      });
    }
    if (listing.active === false) {
      return res.status(409).json({
        message: "This hotel is inactive and cannot be booked.",
        eligibility: {
          eligible: false,
          reasons: [{ code: "HOTEL_INACTIVE", message: "This hotel is inactive and cannot be booked." }],
        },
      });
    }
    if (listing.approvalStatus && listing.approvalStatus !== "approved") {
      return res.status(409).json({
        message: "This hotel has not been approved for booking.",
        eligibility: {
          eligible: false,
          reasons: [{ code: "HOTEL_UNAPPROVED", message: "This hotel has not been approved for booking." }],
        },
      });
    }
    if (listing.isDemo) {
      return res.status(409).json({
        message: "Demo listings are for display and testing only and cannot be booked.",
        eligibility: {
          eligible: false,
          reasons: [{ code: "DEMO_LISTING", message: "Demo listings cannot be booked." }],
        },
      });
    }

    let selectedRoomType;
    if (listing.roomTypes?.length) {
      if (!roomTypeId) {
        return res.status(400).json({
          message: "Select a room type before booking.",
          eligibility: {
            eligible: false,
            reasons: [{ code: "ROOM_REQUIRED", message: "Select a room type before booking." }],
          },
        });
      }
      if (!mongoose.Types.ObjectId.isValid(roomTypeId)) {
        return res.status(400).json({
          message: "A valid room type ID is required.",
          eligibility: {
            eligible: false,
            reasons: [{ code: "INVALID_ROOM_ID", message: "The selected room type ID is invalid." }],
          },
        });
      }
      selectedRoomType = findRoomType(listing, roomTypeId);
      if (!selectedRoomType) {
        return res.status(404).json({
          message: "The selected room type does not belong to this hotel.",
          eligibility: {
            eligible: false,
            reasons: [{ code: "ROOM_NOT_FOUND", message: "The selected room type does not belong to this hotel." }],
          },
        });
      }
    } else if (roomTypeId) {
      return res.status(400).json({
        message: "This hotel has no matching room type.",
        eligibility: {
          eligible: false,
          reasons: [{ code: "ROOM_NOT_FOUND", message: "This hotel has no matching room type." }],
        },
      });
    }

    const rooms = Number(numberOfRooms);
    const guests = Number(numberOfGuests);
    const maxGuestsPerRoom = Number(selectedRoomType?.maxGuests || listing.maxGuestsPerRoom || 4);
    if (guests > maxGuestsPerRoom * rooms) {
      return res.status(400).json({ message: "The selected room type does not have enough guest capacity." });
    }

    const pricePerNightOnServer = Number(selectedRoomType?.price ?? listing.price);
    if (pricePerNight !== undefined && pricePerNight !== null &&
      (!Number.isFinite(Number(pricePerNight)) ||
        Math.abs(Number(pricePerNight) - pricePerNightOnServer) > 0.01)) {
      return res.status(409).json({
        message: "The hotel price has changed. Review the current price before booking.",
        currentPricePerNight: pricePerNightOnServer,
        currency: listing.currency || "INR",
      });
    }

    bookingLock = await acquirePropertyBookingLock(listing._id);
    if (!bookingLock) {
      return res.status(409).json({ message: "This hotel is being booked right now. Please retry in a moment." });
    }
    const lockedRoomType = roomTypeId
      ? findRoomType(bookingLock.property, roomTypeId)
      : null;
    if (roomTypeId && !lockedRoomType) {
      return res.status(409).json({
        message: "The selected room type changed while booking. Please review availability.",
      });
    }
    if (guests > Number(lockedRoomType?.maxGuests || bookingLock.property.maxGuestsPerRoom || 4) * rooms) {
      return res.status(409).json({
        message: "The selected room type capacity changed. Please review the guest count.",
      });
    }
    if (idempotencyKey) {
      const previousRequest = await Booking.findOne({ user: req.user._id, idempotencyKey });
      if (previousRequest) {
        return res.status(200).json({
          message: "This booking request was already processed.",
          booking: previousRequest,
        });
      }
    }
    const bookedRooms = await getBookedRooms({ property: bookingLock.property, checkIn, checkOut });
    const remainingRooms = getRemainingRooms(bookingLock.property, bookedRooms);
    if (remainingRooms < rooms) {
      return res.status(409).json({
        message: "Not enough rooms are available for the selected dates.",
        eligibility: {
          eligible: false,
          reasons: [{ code: "INSUFFICIENT_INVENTORY", message: "Not enough rooms are available for the selected dates." }],
        },
      });
    }
    if (lockedRoomType) {
      const bookedRoomTypeRooms = await getBookedRooms({
        property: bookingLock.property,
        checkIn,
        checkOut,
        roomTypeId: lockedRoomType._id,
      });
      if (getRemainingRooms(lockedRoomType, bookedRoomTypeRooms) < rooms) {
        return res.status(409).json({
          message: "Not enough rooms of this type are available for the selected dates.",
          eligibility: {
            eligible: false,
            reasons: [{ code: "INSUFFICIENT_INVENTORY", message: "Not enough rooms of this type are available for the selected dates." }],
          },
        });
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      ...(idempotencyKey ? { idempotencyKey } : {}),
      property: bookingLock.property.name,
      propertyId: bookingLock.property._id,
      ...(lockedRoomType ? {
        roomTypeId: lockedRoomType._id,
        roomTypeName: lockedRoomType.name,
      } : {}),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: guests,
      numberOfRooms: rooms,
      totalPrice: Number(lockedRoomType?.price ?? bookingLock.property.price) * nights * rooms,
      pricePerNight: Number(lockedRoomType?.price ?? bookingLock.property.price),
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
    if (error.code === 11000 && req.headers?.["idempotency-key"]) {
      const previousRequest = await Booking.findOne({
        user: req.user._id,
        idempotencyKey: String(req.headers["idempotency-key"]).trim(),
      });
      if (previousRequest) {
        return res.status(200).json({
          message: "This booking request was already processed.",
          booking: previousRequest,
        });
      }
    }
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
    let currentPricePerNight = booking.pricePerNight;
    const propertyRecord = booking.propertyId
      ? await Property.findById(booking.propertyId)
      : await Property.findOne({ name: booking.property });
    if (propertyRecord) {
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
      const selectedRoomType = booking.roomTypeId
        ? findRoomType(bookingLock.property, booking.roomTypeId)
        : null;
      if (booking.roomTypeId && !selectedRoomType) {
        return res.status(409).json({ message: "The selected room type is no longer available." });
      }
      const maxGuestsPerRoom = Number(
        selectedRoomType?.maxGuests || bookingLock.property.maxGuestsPerRoom || 4
      );
      if (nextGuests > maxGuestsPerRoom * nextRooms) {
        return res.status(400).json({ message: "The selected rooms do not have enough guest capacity." });
      }
      if (selectedRoomType) {
        const bookedRoomTypeRooms = await getBookedRooms({
          property: bookingLock.property,
          checkIn: nextCheckIn,
          checkOut: nextCheckOut,
          excludeBookingId: booking._id,
          roomTypeId: selectedRoomType._id,
        });
        if (getRemainingRooms(selectedRoomType, bookedRoomTypeRooms) < nextRooms) {
          return res.status(409).json({ message: "Not enough rooms of this type are available for the selected dates." });
        }
      }
      currentPricePerNight = Number(selectedRoomType?.price ?? bookingLock.property.price);
    }

    booking.checkInDate = nextCheckIn;
    booking.checkOutDate = nextCheckOut;
    booking.numberOfGuests = nextGuests;
    booking.numberOfRooms = nextRooms;
    booking.pricePerNight = currentPricePerNight;
    if (typeof specialRequests === "string") booking.specialRequests = specialRequests.slice(0, 2000);
    booking.numberOfNights = Math.round((nextCheckOut - nextCheckIn) / (1000 * 60 * 60 * 24));
    booking.totalPrice = currentPricePerNight * booking.numberOfNights * nextRooms;
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
  getBookingEligibility,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getAllBookings,
  adminUpdateBookingStatus,
  getDateRangeError,
};
