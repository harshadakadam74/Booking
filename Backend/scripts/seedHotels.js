const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Property = require('../models/Property');
const hotelImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
];

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
  ['Nagpur', 'Maharashtra', 2800],
  ['Kochi', 'Kerala', 3600],
  ['Ooty', 'Tamil Nadu', 3200],
  ['Ahmedabad', 'Gujarat', 3300],
  ['Mysuru', 'Karnataka', 3000],
];

const demoListings = destinations.flatMap(([city, state, samplePrice], destinationIndex) => (
  [1, 2].map((number) => {
    const slug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const price = samplePrice + (number - 1) * 500;
    const rooms = number === 1 ? 12 : 8;
    const propertyType = number === 1 ? 'Hotel' : 'Guest house';
    const sampleRating = Number((4.1 + ((destinationIndex + number) % 9) / 10).toFixed(1));
    const sampleRatingCount = 25 + destinationIndex * 5 + number * 11;
    const imageStart = (destinationIndex * 2 + number - 1) % hotelImages.length;
    const images = [0, 1, 2].map((offset) => hotelImages[(imageStart + offset) % hotelImages.length]);

    return {
      name: `FastBooking Demo ${propertyType} ${number} - ${city}`,
      location: `${city}, ${state}, India`,
      address: `Fictional demo address - ${city}; not a real street address`,
      streetAddress: `Fictional demo address - ${city}; not a real street address`,
      city,
      state,
      country: 'India',
      currency: 'INR',
      image: images[0],
      images,
      type: propertyType,
      propertyType,
      category: propertyType,
      description: 'DEVELOPMENT DEMO ONLY. This synthetic listing, its address, photos, sample price, room inventory, amenities, and room types are fictional and not bookable.',
      price,
      rating: sampleRating,
      ratingCount: sampleRatingCount,
      ratingSource: 'Synthetic demo score; not real guest reviews',
      totalRooms: rooms,
      availableRooms: rooms,
      maxGuestsPerRoom: number === 1 ? 3 : 2,
      amenities: ['Wi-Fi (sample only)', 'Parking (sample only)', 'Breakfast (sample only)'],
      roomTypes: [{
        name: 'Standard demo room (sample only)',
        price,
        maxGuests: number === 1 ? 3 : 2,
        totalRooms: Math.ceil(rooms / 2),
        availableRooms: Math.ceil(rooms / 2),
      }, {
        name: 'Deluxe demo room (sample only)',
        price: price + 1000,
        maxGuests: number === 1 ? 3 : 2,
        totalRooms: Math.floor(rooms / 2),
        availableRooms: Math.floor(rooms / 2),
      }],
      checkInTime: '14:00',
      checkOutTime: '11:00',
      isDemo: true,
      isVerified: false,
      listingSource: 'demo',
      sourceProvider: 'fastbooking-demo',
      externalListingId: `demo:india:${slug}:seed-${number}`,
      approvalStatus: 'approved',
      active: true,
    };
  })
));

if (destinations.length !== 25 || demoListings.length !== 50) {
  throw new Error(`Expected 25 demo destinations and 50 hotel listings; found ${destinations.length} destinations and ${demoListings.length} listings.`);
}

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
      update: { $set: listing },
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
    existingListingsUpdated: true,
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
