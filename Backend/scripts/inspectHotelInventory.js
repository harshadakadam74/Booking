const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Property = require('../models/Property');

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  await mongoose.connect(process.env.MONGO_URI);

  const [
    total,
    active,
    approvedOrLegacy,
    demo,
    priceSummary,
    fieldTypes,
    destinations,
    delhiListings,
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ active: { $ne: false } }),
    Property.countDocuments({
      $or: [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }],
    }),
    Property.countDocuments({ isDemo: true }),
    Property.aggregate([
      { $match: { price: { $type: 'number' } } },
      {
        $group: {
          _id: { $ifNull: ['$currency', 'INR (legacy default)'] },
          count: { $sum: 1 },
          minimum: { $min: '$price' },
          maximum: { $max: '$price' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Property.aggregate([
      {
        $group: {
          _id: null,
          priceTypes: { $addToSet: { $type: '$price' } },
          amenityTypes: { $addToSet: { $type: '$amenities' } },
          availableRoomsTypes: { $addToSet: { $type: '$availableRooms' } },
          capacityTypes: { $addToSet: { $type: '$maxGuestsPerRoom' } },
        },
      },
      { $project: { _id: 0 } },
    ]),
    Property.aggregate([
      { $match: { city: { $type: 'string', $ne: '' } } },
      {
        $group: {
          _id: { city: '$city', state: '$state' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, '_id.city': 1 } },
      { $limit: 30 },
    ]),
    Property.find({
      $or: [
        { city: { $regex: 'delhi', $options: 'i' } },
        { state: { $regex: '^delhi$', $options: 'i' } },
        { location: { $regex: 'delhi', $options: 'i' } },
      ],
    })
      .select('name city state location price currency amenities active approvalStatus availableRooms totalRooms maxGuestsPerRoom isDemo')
      .limit(20)
      .lean(),
  ]);

  console.log(JSON.stringify({
    readOnly: true,
    counts: { total, active, approvedOrLegacy, demo },
    priceRangesByCurrency: priceSummary,
    storedFieldTypes: fieldTypes[0] || {},
    destinations: destinations.map(({ _id, count }) => ({ ..._id, count })),
    delhiListings,
  }, null, 2));
};

run()
  .catch((error) => {
    console.error('Hotel inventory inspection failed:', {
      name: error.name,
      code: error.code,
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
