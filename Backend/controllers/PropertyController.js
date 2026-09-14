const Property = require('../models/Property');

const getProperties = async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.type) filter.type = req.query.type;

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Properties fetched successfully', properties });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getNearbyProperties = async (req, res) => {
  try {
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
          query: { active: true, ...(req.query.type ? { type: req.query.type } : {}) },
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
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getProperties, getNearbyProperties };