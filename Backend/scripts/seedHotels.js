const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Property = require('../models/Property');

const destinations = [
  ['Jaipur', 'Rajasthan', 2500],
  ['Mumbai', 'Maharashtra', 4200],
  ['Pune', 'Maharashtra', 3000],
  ['Delhi', 'Delhi', 3800],
  ['Goa', 'Goa', 5000],
  ['Hyderabad', 'Telangana', 3500],
  ['Bengaluru', 'Karnataka', 3600],
  ['Chennai', 'Tamil Nadu', 3400],
  ['Udaipur', 'Rajasthan', 3900],
  ['Agra', 'Uttar Pradesh', 3000],
  ['Manali', 'Himachal Pradesh', 3200],
  ['Shimla', 'Himachal Pradesh', 3300],
  ['Lonavala', 'Maharashtra', 3500],
  ['Nashik', 'Maharashtra', 2900],
  ['Mahabaleshwar', 'Maharashtra', 3100],
  ['Nanded', 'Maharashtra', 1800],
  ['Aurangabad', 'Maharashtra', 2800],
  ['Amritsar', 'Punjab', 3200],
  ['Kolkata', 'West Bengal', 3400],
  ['Varanasi', 'Uttar Pradesh', 3000],
];

const demoListings = destinations.flatMap(([city, state, samplePrice]) => (
  [1, 2].map((number) => {
    const slug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const price = samplePrice + (number - 1) * 500;
    const rooms = number === 1 ? 12 : 8;
    const propertyType = number === 1 ? 'Hotel' : 'Guest house';

    return {
      name: `FastBooking Demo ${propertyType} ${number} - ${city}`,
      location: `${city}, ${state}, India`,
      city,
      state,
      country: 'India',
      currency: 'INR',
      type: propertyType,
      propertyType,
      category: propertyType,
      description: 'DEVELOPMENT DEMO ONLY. This synthetic listing, its sample price, room inventory, amenities, and room type are not real or bookable.',
      price,
      totalRooms: rooms,
      availableRooms: rooms,
      maxGuestsPerRoom: number === 1 ? 3 : 2,
      amenities: ['Development sample amenity (not verified)'],
      roomTypes: [{
        name: 'Demo room type (sample only)',
        price,
        maxGuests: number === 1 ? 3 : 2,
        totalRooms: rooms,
        availableRooms: rooms,
      }],
      isDemo: true,
      isVerified: false,
      listingSource: 'demo',
      sourceProvider: 'fastbooking-demo',
      externalListingId: `demo:india:${slug}:seed-${number}`,
      approvalStatus: 'pending',
      active: false,
    };
  })
));

const run = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Synthetic listings can only be seeded when NODE_ENV=development.');
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');

  await mongoose.connect(process.env.MONGO_URI);
  const operations = demoListings.map((listing) => ({
    updateOne: {
      filter: {
        listingSource: listing.listingSource,
        sourceProvider: listing.sourceProvider,
        externalListingId: listing.externalListingId,
      },
      update: { $setOnInsert: listing },
      upsert: true,
    },
  }));
  const result = await Property.bulkWrite(operations, { ordered: false });
  const storedCount = await Property.countDocuments({
    sourceProvider: 'fastbooking-demo',
    externalListingId: { $in: demoListings.map((listing) => listing.externalListingId) },
  });

  if (storedCount !== demoListings.length) {
    throw new Error(`Seed verification failed: expected ${demoListings.length} demo listings, found ${storedCount}.`);
  }
  console.log(JSON.stringify({
    developmentOnly: true,
    expectedListings: demoListings.length,
    insertedListings: result.upsertedCount,
    existingListingsPreserved: true,
    verifiedListings: storedCount,
    bookingEnabled: false,
  }, null, 2));
};

run()
  .catch((error) => {
    console.error('Hotel seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
