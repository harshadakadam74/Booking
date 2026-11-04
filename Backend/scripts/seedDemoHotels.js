const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Property = require('../models/Property');

const demoListings = [
  {
    name: 'FastBooking Demo Hotel - Jaipur',
    location: 'Jaipur, Rajasthan, India',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    currency: 'INR',
    type: 'Hotel',
    propertyType: 'Hotel',
    description: 'Synthetic sample record for testing the search and booking interface. This is not a real hotel.',
    price: 2500,
    totalRooms: 12,
    availableRooms: 12,
    maxGuestsPerRoom: 3,
    amenities: ['Wi-Fi', 'Parking'],
    isDemo: true,
    isVerified: false,
    listingSource: 'demo',
    sourceProvider: 'fastbooking-demo',
    externalListingId: 'demo:india:jaipur:001',
    approvalStatus: 'approved',
    active: true,
  },
  {
    name: 'FastBooking Demo Homestay - Kochi',
    location: 'Kochi, Kerala, India',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    currency: 'INR',
    type: 'Homestay',
    propertyType: 'Homestay',
    description: 'Synthetic sample record for testing the search and booking interface. This is not a real homestay.',
    price: 1800,
    totalRooms: 5,
    availableRooms: 5,
    maxGuestsPerRoom: 2,
    amenities: ['Wi-Fi', 'Kitchen'],
    isDemo: true,
    isVerified: false,
    listingSource: 'demo',
    sourceProvider: 'fastbooking-demo',
    externalListingId: 'demo:india:kochi:001',
    approvalStatus: 'approved',
    active: true,
  },
  {
    name: 'FastBooking Demo Resort - Shillong',
    location: 'Shillong, Meghalaya, India',
    city: 'Shillong',
    state: 'Meghalaya',
    country: 'India',
    currency: 'INR',
    type: 'Resort',
    propertyType: 'Resort',
    description: 'Synthetic sample record for testing the search and booking interface. This is not a real resort.',
    price: 3200,
    totalRooms: 8,
    availableRooms: 8,
    maxGuestsPerRoom: 4,
    amenities: ['Wi-Fi', 'Parking', 'Restaurant'],
    isDemo: true,
    isVerified: false,
    listingSource: 'demo',
    sourceProvider: 'fastbooking-demo',
    externalListingId: 'demo:india:shillong:001',
    approvalStatus: 'approved',
    active: true,
  },
];

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  await mongoose.connect(process.env.MONGO_URI);
  const operations = demoListings.map((listing) => ({
    updateOne: {
      filter: {
        listingSource: 'demo',
        sourceProvider: listing.sourceProvider,
        externalListingId: listing.externalListingId,
      },
      update: { $setOnInsert: listing },
      upsert: true,
    },
  }));
  const result = await Property.bulkWrite(operations, { ordered: false });
  console.log(`Demo hotels seeded: ${result.upsertedCount} added; existing records left unchanged.`);
};

run()
  .catch((error) => {
    console.error('Demo hotel seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
