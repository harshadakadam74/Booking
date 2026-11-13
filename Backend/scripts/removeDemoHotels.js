const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

const demoFilter = {
  isDemo: true,
  sourceProvider: 'fastbooking-demo-150',
};
const isLoopbackMongoUri = (value) => {
  try {
    const hostname = new URL(value).hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
};

const run = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Demo listings can only be removed from a development database.');
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  if (!isLoopbackMongoUri(process.env.MONGO_URI)) {
    throw new Error('Demo inventory can only be removed from local MongoDB (localhost/127.0.0.1/::1).');
  }
  if (!process.argv.includes('--confirm')) {
    throw new Error('Pass --confirm to remove the tagged demo listings from MongoDB.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const listings = await Property.find(demoFilter).select('_id name').lean();
  if (listings.length === 0) {
    console.log(JSON.stringify({
      database: mongoose.connection.name,
      removedDemoListings: 0,
      remainingDemoListings: 0,
    }, null, 2));
    return;
  }
  if (listings.length !== 150) {
    throw new Error(`Expected exactly 150 FastBooking demo listings or none; found ${listings.length}. No records were removed.`);
  }

  const listingIds = listings.map((listing) => listing._id);
  const listingNames = listings.map((listing) => listing.name);
  const linkedBooking = await Booking.findOne({
    $or: [
      { propertyId: { $in: listingIds } },
      { property: { $in: listingNames } },
    ],
  }).select('_id').lean();
  if (linkedBooking) {
    throw new Error('Demo listings have booking history. No records were removed to preserve booking references.');
  }

  const result = await Property.deleteMany({
    ...demoFilter,
    _id: { $in: listingIds },
  });
  const remaining = await Property.countDocuments(demoFilter);
  if (result.deletedCount !== 150 || remaining !== 0) {
    throw new Error(`Demo removal verification failed: removed ${result.deletedCount}, remaining ${remaining}.`);
  }

  console.log(JSON.stringify({
    database: mongoose.connection.name,
    removedDemoListings: result.deletedCount,
    remainingDemoListings: remaining,
  }, null, 2));
};

run()
  .catch((error) => {
    console.error('Demo hotel removal failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
