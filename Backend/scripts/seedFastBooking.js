const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Property = require('../models/Property');
const Destination = require('../models/Destination');
const hotels = require('../hotels.json');
const places = require('../places.json');

const demoHotelImages = [
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
];

const isLoopbackMongoUri = (value) => {
  try {
    const hostname = new URL(value).hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
};
const normalize = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const validateData = () => {
  if (hotels.length !== 150 || places.length !== 109) {
    throw new Error(`Expected 150 demo hotels and 109 places; found ${hotels.length} hotels and ${places.length} places.`);
  }

  const hotelIds = new Set();
  for (const [index, hotel] of hotels.entries()) {
    if (
      !hotel || typeof hotel.name !== 'string' || !hotel.name.startsWith('FastBooking Demo ') ||
      typeof hotel.city !== 'string' || typeof hotel.state !== 'string' ||
      typeof hotel.externalListingId !== 'string' || !hotel.externalListingId.trim() ||
      !Number.isFinite(Number(hotel.price)) ||
      !Number.isInteger(Number(hotel.totalRooms)) || Number(hotel.totalRooms) < 1 ||
      !Number.isInteger(Number(hotel.availableRooms)) ||
      Number(hotel.availableRooms) < 0 || Number(hotel.availableRooms) > Number(hotel.totalRooms)
    ) {
      throw new Error(`Demo hotel record ${index + 1} has invalid required fields.`);
    }
    if (hotelIds.has(hotel.externalListingId)) {
      throw new Error(`Duplicate demo hotel externalListingId: ${hotel.externalListingId}`);
    }
    hotelIds.add(hotel.externalListingId);
  }

  const placeIds = new Set();
  for (const [index, place] of places.entries()) {
    const normalizedName = String(place?.name || '').trim().toLowerCase();
    if (!normalizedName || typeof place.state !== 'string' || !place.state.trim()) {
      throw new Error(`Place record ${index + 1} has invalid required fields.`);
    }
    if (placeIds.has(normalizedName)) {
      throw new Error(`Duplicate place name: ${place.name}`);
    }
    placeIds.add(normalizedName);
  }
};

const run = async () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Demo inventory can only be loaded with NODE_ENV=development.');
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  if (!isLoopbackMongoUri(process.env.MONGO_URI)) {
    throw new Error('Demo inventory is restricted to local MongoDB (localhost/127.0.0.1/::1).');
  }
  if (!process.argv.includes('--confirm-demo')) {
    throw new Error('Pass --confirm-demo to load clearly labeled, non-bookable demo data.');
  }
  validateData();

  await mongoose.connect(process.env.MONGO_URI);

  const hotelOperations = hotels.map((hotel, index) => {
    const { geoLocation, ...fields } = hotel;
    const images = Array.from({ length: 3 }, (_, imageIndex) => (
      demoHotelImages[(index + imageIndex) % demoHotelImages.length]
    ));
    const listing = {
      ...fields,
      image: images[0],
      images,
      normalizedCity: normalize(hotel.city || hotel.location),
      normalizedState: normalize(hotel.state),
      normalizedCountry: normalize(hotel.country || 'India'),
      normalizedAmenities: [...new Set((hotel.amenities || []).map(normalize).filter(Boolean))],
      listingSource: 'demo',
      sourceProvider: 'fastbooking-demo-150',
      isDemo: true,
      isVerified: false,
      approvalStatus: 'approved',
      active: true,
    };
    if (geoLocation?.coordinates?.length === 2) listing.geoLocation = geoLocation;

    return {
      updateOne: {
        filter: {
          listingSource: 'demo',
          sourceProvider: 'fastbooking-demo-150',
          externalListingId: hotel.externalListingId,
        },
        update: { $set: listing },
        upsert: true,
      },
    };
  });
  const placeOperations = places.map((place) => {
    const name = place.name.trim();
    const normalizedName = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const latitude = Number(place.latitude);
    const longitude = Number(place.longitude);
    return {
      updateOne: {
        filter: { normalizedName },
        update: {
          $setOnInsert: {
            name,
            normalizedName,
            state: place.state.trim(),
            country: String(place.country || 'India').trim(),
            type: String(place.type || 'City').trim(),
            description: String(place.description || '').slice(0, 1000),
            aliases: [],
            active: place.isActive !== false,
            ...(Number.isFinite(latitude) && Number.isFinite(longitude) &&
              Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
              ? { coordinates: { latitude, longitude } }
              : {}),
          },
        },
        upsert: true,
      },
    };
  });

  const [hotelResult, placeResult] = await Promise.all([
    Property.bulkWrite(hotelOperations, { ordered: false }),
    Destination.bulkWrite(placeOperations, { ordered: false }),
  ]);
  const [storedHotels, storedPlaces] = await Promise.all([
    Property.countDocuments({
      listingSource: 'demo',
      sourceProvider: 'fastbooking-demo-150',
      externalListingId: { $in: hotels.map((hotel) => hotel.externalListingId) },
      isDemo: true,
    }),
    Destination.countDocuments({
      normalizedName: {
        $in: places.map((place) => place.name.trim().normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '').toLowerCase()),
      },
    }),
  ]);

  const imageBearingHotels = await Property.countDocuments({
    listingSource: 'demo',
    sourceProvider: 'fastbooking-demo-150',
    externalListingId: { $in: hotels.map((hotel) => hotel.externalListingId) },
    isDemo: true,
    image: { $in: demoHotelImages },
    'images.2': { $in: demoHotelImages },
  });

  if (
    storedHotels !== hotels.length ||
    imageBearingHotels !== hotels.length ||
    storedPlaces !== places.length
  ) {
    throw new Error(
      `Seed verification failed: ${storedHotels}/${hotels.length} hotels, ` +
      `${imageBearingHotels}/${hotels.length} image-bearing hotels, and ` +
      `${storedPlaces}/${places.length} places are stored.`,
    );
  }

  console.log(JSON.stringify({
    database: mongoose.connection.name,
    demoOnly: true,
    bookingEnabled: false,
    hotels: {
      expected: hotels.length,
      verified: storedHotels,
      withImages: imageBearingHotels,
      inserted: hotelResult.upsertedCount,
    },
    places: {
      expected: places.length,
      verified: storedPlaces,
      inserted: placeResult.upsertedCount,
    },
  }, null, 2));
};

run()
  .catch((error) => {
    console.error('FastBooking demo seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
