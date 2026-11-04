const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

const activeBookingStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN'];

const getRemainingRooms = (property, bookedRooms = 0) => {
  const totalRooms = Number(property.totalRooms || property.availableRooms || 0);
  const listedRooms = property.availableRooms === undefined
    ? totalRooms
    : Number(property.availableRooms);
  return Math.max(0, Math.min(totalRooms, listedRooms) - Number(bookedRooms || 0));
};

const acquirePropertyBookingLock = async (propertyId) => {
  const token = randomUUID();
  const now = new Date();
  const property = await Property.findOneAndUpdate(
    {
      _id: propertyId,
      active: { $ne: false },
      $and: [
        { $or: [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }] },
        {
          $or: [
            { 'bookingLock.expiresAt': { $exists: false } },
            { 'bookingLock.expiresAt': { $lt: now } },
          ],
        },
      ],
    },
    {
      $set: {
        'bookingLock.token': token,
        'bookingLock.expiresAt': new Date(now.getTime() + 60 * 1000),
      },
    },
    { new: true }
  );
  return property ? { property, token } : null;
};

const releasePropertyBookingLock = async (propertyId, token) => {
  await Property.updateOne(
    { _id: propertyId, 'bookingLock.token': token },
    { $unset: { bookingLock: 1 } }
  );
};

const getBookedRooms = async ({ property, checkIn, checkOut, excludeBookingId }) => {
  const filter = {
    bookingStatus: { $in: activeBookingStatuses },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
    $or: [
      { propertyId: property._id },
      { property: property.name, propertyId: { $exists: false } },
    ],
  };
  if (excludeBookingId) filter._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
  const [reservation = { roomsBooked: 0 }] = await Booking.aggregate([
    { $match: filter },
    { $group: { _id: null, roomsBooked: { $sum: '$numberOfRooms' } } },
  ]);
  return reservation.roomsBooked;
};

const acquireBookingStatusLock = async (booking) => {
  const property = booking.propertyId
    ? await Property.findById(booking.propertyId)
    : await Property.findOne({ name: booking.property });
  if (!property) return { error: 'Hotel inventory could not be verified for this booking.' };
  if (property.isDemo) return { error: 'Demo listings cannot have active bookings.' };

  const bookingLock = await acquirePropertyBookingLock(property._id);
  if (!bookingLock) return { error: 'Hotel inventory is unavailable or currently being updated.' };

  try {
    const bookedRooms = await getBookedRooms({
      property: bookingLock.property,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      excludeBookingId: booking._id,
    });
    if (getRemainingRooms(bookingLock.property, bookedRooms) < booking.numberOfRooms) {
      return {
        bookingLock,
        error: 'There are not enough rooms to activate this booking.',
      };
    }
    return { bookingLock };
  } catch (error) {
    try {
      await releasePropertyBookingLock(bookingLock.property._id, bookingLock.token);
    } catch (releaseError) {
      console.error('Unable to release hotel booking lock after inventory check failure:', releaseError.message);
    }
    throw error;
  }
};

module.exports = {
  activeBookingStatuses,
  getRemainingRooms,
  acquirePropertyBookingLock,
  releasePropertyBookingLock,
  getBookedRooms,
  acquireBookingStatusLock,
};
