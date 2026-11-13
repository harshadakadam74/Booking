const Property = require('../models/Property');
const mongoose = require('mongoose');
const { parseHotelSearch, searchHotels } = require('../services/hotelSearch');
const BookingController = require('./BookingController');

const getPropertyById = async (req, res) => {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'A valid hotel ID is required.' });
  }

  try {
    const property = await Property.findById(id).lean();
    if (!property) {
      return res.status(404).json({ message: 'Hotel not found.' });
    }

    return res.status(200).json({ message: 'Hotel fetched successfully.', property });
  } catch (error) {
    console.error('Hotel lookup failed:', error.message);
    return res.status(500).json({ message: 'Unable to load this hotel right now.' });
  }
};

const getPropertyAvailability = async (req, res) => {
  const query = req.query || {};
  const scalarParams = ['checkIn', 'checkOut', 'guests', 'rooms', 'roomTypeId'];
  if (scalarParams.some((key) => query[key] !== undefined && typeof query[key] !== 'string')) {
    return res.status(400).json({ message: 'Availability parameters must be single values.' });
  }

  return BookingController.getBookingEligibility({
    body: {
      propertyId: req.params.id,
      checkInDate: query.checkIn,
      checkOutDate: query.checkOut,
      numberOfGuests: query.guests,
      numberOfRooms: query.rooms,
      ...(query.roomTypeId ? { roomTypeId: query.roomTypeId } : {}),
    },
  }, res);
};

const getProperties = async (req, res) => {
  try {
    const parsed = parseHotelSearch(req.query);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const result = await searchHotels(parsed.criteria);
    return res.status(200).json({
      message: result.properties.length ? 'Hotels fetched successfully.' : 'No hotels matched these filters.',
      ...result,
    });
  } catch (error) {
    console.error('Hotel search failed:', error.message);
    return res.status(500).json({ message: 'Unable to search hotels.' });
  }
};

const getNearbyProperties = async (req, res) => {
  try {
    if (req.query.includeDemo !== undefined &&
      !['true', 'false', true, false].includes(req.query.includeDemo)) {
      return res.status(400).json({ message: 'includeDemo must be true or false.' });
    }
    const includeDemo = req.query.includeDemo === 'true' || req.query.includeDemo === true;
    if (includeDemo && process.env.NODE_ENV !== 'development') {
      return res.status(400).json({
        message: 'Demo listings are available only when the backend is running in development mode.',
      });
    }

    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radiusKm = Number(req.query.radius || 10);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
      return res.status(400).json({ message: 'Radius must be between 1 and 100 km' });
    }

    const properties = await Property.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          key: 'geoLocation',
          distanceField: 'distanceMeters',
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            active: { $ne: false },
            ...(!includeDemo ? { isDemo: { $ne: true } } : {}),
            $and: [
              { $or: [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }] },
              ...(req.query.type ? [{ $or: [{ type: req.query.type }, { propertyType: req.query.type }] }] : []),
            ],
          },
        },
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
        },
      },
      { $project: { distanceMeters: 0 } },
    ]);

    return res.status(200).json({ message: 'Nearby properties fetched successfully', properties });
  } catch (error) {
    console.error('Nearby property search failed:', error.message);
    return res.status(500).json({ message: 'Unable to load nearby properties.' });
  }
};

module.exports = { getPropertyById, getPropertyAvailability, getProperties, getNearbyProperties };